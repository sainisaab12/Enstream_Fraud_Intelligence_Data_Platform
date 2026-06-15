import os
import json
import uuid
import time
import sqlite3
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from app.state import state
from app.quality import run_dq_check

# Determine storage backend
WAREHOUSE_PATH = os.getenv("WAREHOUSE_PATH", "./warehouse").rstrip("/")
USE_S3 = WAREHOUSE_PATH.startswith("s3://")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

s3_fs = None
if USE_S3:
    import s3fs
    s3_fs = s3fs.S3FileSystem(
        key=os.getenv("AWS_ACCESS_KEY_ID"),
        secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
        client_kwargs={"region_name": AWS_REGION}
    )
    print(f"Medallion: Using AWS S3 Storage at {WAREHOUSE_PATH}")
else:
    os.makedirs(WAREHOUSE_PATH, exist_ok=True)
    print(f"Medallion: Using Local Storage at {WAREHOUSE_PATH}")

# Glue Catalog & Redshift configuration placeholders
GLUE_CATALOG_ENABLED = os.getenv("AWS_ACCESS_KEY_ID") is not None
REDSHIFT_CONN_STR = os.getenv("REDSHIFT_CONN_STR") # e.g. redshift://user:pass@host:5439/db

# Initialize Local SQLite for Gold/Metadata if Redshift is not connected
sqlite_db_path = "enstream_local_olap.db"
def get_sqlite_conn():
    conn = sqlite3.connect(sqlite_db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Setup local database tables
def init_local_olap():
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    # Gold Table (Redshift mock)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enstream_gold (
            msisdn TEXT PRIMARY KEY,
            customer_name TEXT,
            carrier TEXT,
            msisdn_age_days INTEGER,
            port_frequency_30d INTEGER,
            activation_recency_hours REAL,
            device_churn_count INTEGER,
            fraud_exchange_matches INTEGER,
            network_fraud_ring_size INTEGER,
            last_update_time REAL
        )
    """)
    conn.commit()
    conn.close()

init_local_olap()

def write_data_file(df: pd.DataFrame, relative_path: str) -> str:
    """Writes a Pandas DataFrame as Parquet to Local or S3"""
    full_path = f"{WAREHOUSE_PATH}/{relative_path}"
    table = pa.Table.from_pandas(df)
    
    if USE_S3:
        with s3_fs.open(full_path, "wb") as f:
            pq.write_table(table, f)
    else:
        dir_path = os.path.dirname(full_path)
        os.makedirs(dir_path, exist_ok=True)
        pq.write_table(table, full_path)
    return full_path

def write_iceberg_metadata(table_name: str, parquet_file_path: str, df: pd.DataFrame):
    """
    Generates simulated Apache Iceberg table metadata.
    Creates a v<N>.metadata.json file and version-hint.text
    """
    table_dir = f"enstream/{table_name.replace('enstream.', '')}"
    metadata_dir = f"{table_dir}/metadata"
    
    # Check version
    version = 1
    version_hint_path = f"{WAREHOUSE_PATH}/{metadata_dir}/version-hint.text"
    
    if USE_S3:
        if s3_fs.exists(version_hint_path):
            with s3_fs.open(version_hint_path, "r") as fh:
                version = int(fh.read().strip()) + 1
    else:
        if os.path.exists(version_hint_path):
            with open(version_hint_path, "r") as fh:
                version = int(fh.read().strip()) + 1
                
    metadata_filename = f"v{version}.metadata.json"
    metadata_path = f"{metadata_dir}/{metadata_filename}"
    
    # Define simple Iceberg metadata structure
    schema_fields = [{"id": idx, "name": col, "type": str(df[col].dtype), "required": False} 
                     for idx, col in enumerate(df.columns)]
    
    metadata = {
        "format-version": 2,
        "table-uuid": str(uuid.uuid4()),
        "location": f"{WAREHOUSE_PATH}/{table_dir}",
        "last-sequence-number": version,
        "last-updated-ms": int(time.time() * 1000),
        "current-schema-id": 0,
        "schemas": [{"type": "struct", "schema-id": 0, "fields": schema_fields}],
        "current-spec-id": 0,
        "partition-specs": [{"spec-id": 0, "fields": []}],
        "snapshots": [
            {
                "snapshot-id": int(time.time()),
                "timestamp-ms": int(time.time() * 1000),
                "summary": {"operation": "append", "added-data-files": "1"},
                "manifest-list": parquet_file_path
            }
        ]
    }
    
    # Write JSON metadata
    metadata_full_path = f"{WAREHOUSE_PATH}/{metadata_path}"
    if USE_S3:
        with s3_fs.open(metadata_full_path, "w") as f:
            json.dump(metadata, f, indent=2)
        with s3_fs.open(version_hint_path, "w") as f:
            f.write(str(version))
    else:
        os.makedirs(os.path.dirname(metadata_full_path), exist_ok=True)
        with open(metadata_full_path, "w") as f:
            json.dump(metadata, f, indent=2)
        with open(version_hint_path, "w") as f:
            f.write(str(version))

def write_to_bronze(event: dict, source: str) -> dict:
    """Ingests raw events into enstream.bronze Iceberg table"""
    bronze_rec = {
        "event_id": event.get("event_id", str(uuid.uuid4())),
        "event_type": event.get("event_type", "unknown"),
        "msisdn": event.get("msisdn", ""),
        "payload": json.dumps(event),
        "source": source,
        "ingested_at": time.time()
    }
    
    # Save to memory state
    with state.lock:
        state.bronze.append(bronze_rec)
        
    # Write to local/S3 parquet file (Iceberg-style layout)
    file_id = str(uuid.uuid4())[:8]
    rel_path = f"enstream/bronze/data/ingested_at={int(time.time())//3600}/{file_id}.parquet"
    df = pd.DataFrame([bronze_rec])
    parquet_path = write_data_file(df, rel_path)
    
    # Write Iceberg metadata
    write_iceberg_metadata("enstream.bronze", parquet_path, df)
    
    # Update state counts
    state.ingestion_status[source]["rows"] += 1
    state.ingestion_status[source]["watermark"] = bronze_rec["ingested_at"]
    
    return bronze_rec

def process_bronze_to_silver() -> list:
    """ETL pipeline from Bronze to Silver. Validates schemas & runs DQ checks"""
    processed_records = []
    
    # Read un-processed records from bronze memory state
    with state.lock:
        processed_ids = {x.get("event_id") for x in state.silver}
        unprocessed = [x for x in state.bronze if x.get("event_id") not in processed_ids]
        
    for item in unprocessed:
        raw_payload = json.loads(item["payload"])
        source = item["source"]
        
        # Run Data Quality checks
        dq_passed, dq_errors = run_dq_check(raw_payload, source)
        
        # Standardize carriers and device numbers (normalization)
        carrier = raw_payload.get("carrier") or raw_payload.get("source_carrier") or raw_payload.get("target_carrier") or source
        carrier = carrier.lower()
        
        imei = raw_payload.get("imei", "")
        
        silver_rec = {
            "event_id": item["event_id"],
            "event_type": item["event_type"],
            "msisdn": item["msisdn"],
            "carrier": carrier,
            "imei": imei,
            "timestamp": raw_payload.get("timestamp") or item["ingested_at"],
            "validated_at": time.time(),
            "dq_passed": dq_passed,
            "dq_errors": json.dumps(dq_errors),
            "normalized_payload": json.dumps(raw_payload)
        }
        
        # Append to Silver
        with state.lock:
            state.silver.append(silver_rec)
        processed_records.append(silver_rec)
        
        # Write to local/S3 parquet file
        file_id = str(uuid.uuid4())[:8]
        rel_path = f"enstream/silver/data/dt={int(time.time())//86400}/{file_id}.parquet"
        df = pd.DataFrame([silver_rec])
        parquet_path = write_data_file(df, rel_path)
        
        # Write Iceberg metadata
        write_iceberg_metadata("enstream.silver", parquet_path, df)
        
    return processed_records

def write_to_gold(gold_df: pd.DataFrame):
    """Writes calculated features to the Gold dataset (Redshift / local SQLite)"""
    # Update memory state
    with state.lock:
        for _, row in gold_df.iterrows():
            state.gold[row["msisdn"]] = row.to_dict()
            
    # Mock / Real AWS Redshift Write
    if REDSHIFT_CONN_STR:
        try:
            import redshift_connector
            # Parse connection details
            print(f"Redshift: Simulated write of {len(gold_df)} rows to AWS Redshift cluster.")
        except Exception as e:
            print(f"Redshift Write Error: {e}. Falling back to SQLite.")
            
    # Always write to SQLite locally for the dashboard API to read
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    for _, row in gold_df.iterrows():
        cursor.execute("""
            INSERT INTO enstream_gold (
                msisdn, customer_name, carrier, msisdn_age_days, 
                port_frequency_30d, activation_recency_hours, 
                device_churn_count, fraud_exchange_matches, 
                network_fraud_ring_size, last_update_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(msisdn) DO UPDATE SET
                customer_name = excluded.customer_name,
                carrier = excluded.carrier,
                msisdn_age_days = excluded.msisdn_age_days,
                port_frequency_30d = excluded.port_frequency_30d,
                activation_recency_hours = excluded.activation_recency_hours,
                device_churn_count = excluded.device_churn_count,
                fraud_exchange_matches = excluded.fraud_exchange_matches,
                network_fraud_ring_size = excluded.network_fraud_ring_size,
                last_update_time = excluded.last_update_time
        """, (
            row["msisdn"], row["customer_name"], row["carrier"], 
            int(row["msisdn_age_days"]), int(row["port_frequency_30d"]), 
            float(row["activation_recency_hours"]), int(row["device_churn_count"]), 
            int(row["fraud_exchange_matches"]), int(row["network_fraud_ring_size"]), 
            float(row["last_update_time"])
        ))
    conn.commit()
    conn.close()

def get_gold_record(msisdn: str) -> dict:
    """Reads from the Gold table"""
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM enstream_gold WHERE msisdn = ?", (msisdn,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {}
