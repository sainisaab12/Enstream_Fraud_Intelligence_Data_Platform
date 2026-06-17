# EnStream Fraud Intelligence Platform: Detailed Technical Architecture (HLD & LLD)

This document contains the comprehensive, technical High-Level Design (HLD) and Low-Level Design (LLD) specifications for the **EnStream Fraud Intelligence Platform**. 

---

## 1. System Overview & Context

EnStream operates as a real-time trust and fraud intelligence clearinghouse for telecommunications carriers and financial institutions. By aggregating events from distributed sources, the system computes risk scoring features and evaluates subscriber identities.

### 1.1 Core Business Metrics
* **Trust Score (0–100)**: Numerical trust index (100 = completely trustworthy, 0 = high suspicion).
* **Suspicion Tier**: Risk categorization (Low Risk, Medium Risk, High Risk).
* **Fraud Flags**: Boolean triggers indicating immediate blacklist or suspicious risk threshold violation.
* **Reason Codes**: String identifiers detailing why scores were adjusted (e.g., `SIM_SWAP_VELOCITY`, `FRAUD_EXCHANGE_HIT`).
* **SHAP Explainability**: Mathematical attribution vector detailing the exact points subtracted by each individual rule feature.

---

## 2. High-Level Design (HLD)

### 2.1 Complete Architectural Topography

The platform follows an event-driven lambda pattern running over a Medallion Lakehouse format:

![EnStream Detailed Technical Architecture Architecture](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/enstream_detailed_architecture_v3_1781697546374.png)

![EnStream Executive Control Room UI](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/enstream_dashboard_ui_1781518274569.png)


```mermaid
flowchart TB
    subgraph Ingestion Edge
        Bell[Bell API Gateway]
        Rogers[Rogers API Gateway]
        Telus[Telus API Gateway]
        TU[TransUnion PortPS Gateway]
        CDC[MySQL Client CDC Agent]
        SFTP[SFTP Blacklist Collector]
    end

    subgraph Streaming Event Layer
        EventBus[FastAPI Event Queue / Kafka Simulation]
        SSE[Server-Sent Events Broadcast Service]
    end

    subgraph Medallion Storage Engine
        subgraph S3 Parquet Landing Zone
            Bronze[enstream.bronze Iceberg Table]
        end
        subgraph S3 Parquet Cleansed Zone
            Silver[enstream.silver Iceberg Table]
        end
        subgraph OLAP Data Warehouse
            Gold[(enstream_gold Redshift Table)]
        end
    end

    subgraph Computational Pipeline
        DQ[Data Quality SLA Validator]
        DirtyScheduler[Dirty-Flag Recompute Scheduler]
        FeatureStore[(In-Memory Feature Store / DynamoDB)]
        Scoring[Rules Engine & Model Inference Service]
        MLOps[Model Registry & Drift Analytics]
    end

    subgraph Presentation & Control
        UI[Vite + React TS Single Page App]
    end

    %% Ingestion Connections
    Bell & Rogers & Telus & TU & CDC & SFTP -->|POST Raw JSON| EventBus
    EventBus -->|Write Row| Bronze
    
    %% Medallion Promotion Flow
    Bronze -->|Read Raw Row| DQ
    DQ -->|Verify SLA Rules| Silver
    DQ -->|If Failed| Quarantine[Quarantine State Log]
    
    %% Feature Computation Flow
    Silver -->|If Passed| DirtyScheduler
    DirtyScheduler -->|Trigger MSISDN Check| FeatureStore
    FeatureStore -->|Compute Aggregates| Gold
    
    %% Scoring Execution
    FeatureStore -->|Load Vector| Scoring
    MLOps -->|Load Champion Weights| Scoring
    Scoring -->|Write Trust Cache| EventBus
    
    %% Real-time Broadcast
    EventBus -->|Publish SSE Msg| SSE
    SSE -->|Stream API| UI
    Gold -->|Query Features| UI
```

### 2.2 Ingestion Source Payload Schemas
The platform standardizes diverse ingestion payloads on the event bus:

1. **Carrier Event Payload** (Bell, Rogers, Telus):
   ```json
   {
     "event_id": "uuid-string",
     "event_type": "activation | device_update | msisdn_update",
     "msisdn": "14165550000",
     "imei": "15-digit-string-imei",
     "carrier": "bell | rogers | telus",
     "timestamp": 1781518000.00
   }
   ```
2. **TransUnion PortPS Payload**:
   ```json
   {
     "event_id": "uuid-string",
     "event_type": "porting",
     "msisdn": "14165550000",
     "source_carrier": "rogers",
     "target_carrier": "bell",
     "timestamp": 1781518000.00
   }
   ```
3. **MySQL CDC Database Payload**:
   ```json
   {
     "event_id": "uuid-string",
     "event_type": "customer_update",
     "msisdn": "14165550000",
     "customer_name": "John Doe",
     "timestamp": 1781518000.00
   }
   ```
4. **SFTP Fraud Blacklist Payload**:
   ```json
   {
     "event_id": "uuid-string",
     "event_type": "fraud_exchange_hit",
     "msisdn": "14165550000",
     "reason": "identity_theft | sim_swapping | payment_fraud",
     "timestamp": 1781518000.00
   }
   ```

---

## 3. Low-Level Design (LLD)

### 3.1 Data Lineage & Storage Layer
The physical data storage implements the **Apache Iceberg Table Format v2** design.

![Data Lineage Pipeline Flow](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/data_lineage_pipeline_1781518291125.png)


#### 3.1.1 Bronze Table Details
* **Logical Name**: `enstream.bronze`
* **Physical Location**: `WAREHOUSE_PATH/enstream/bronze/data/`
* **Iceberg Metadata Folder**: `WAREHOUSE_PATH/enstream/bronze/metadata/`
  * Contains `v<N>.metadata.json` mapping table schema, snapshots, partition specs, and `version-hint.text` pointing to the latest version.
* **Fields**:
  | Column | Data Type | Iceberg Type | Description |
  | :--- | :--- | :--- | :--- |
  | `event_id` | `string` | `string` | UUID generated per incoming packet. Primary key. |
  | `event_type` | `string` | `string` | Nature of transaction event. |
  | `msisdn` | `string` | `string` | Target subscriber telephone number (E.164 format). |
  | `payload` | `string` | `string` | Full JSON body stringified. |
  | `source` | `string` | `string` | Ingress platform source (e.g. `bell`, `transunion`). |
  | `ingested_at` | `double` | `double` | Epoch timestamp when committed to Bronze. |

#### 3.1.2 Silver Table Details
* **Logical Name**: `enstream.silver`
* **Physical Location**: `WAREHOUSE_PATH/enstream/silver/data/`
* **Iceberg Metadata Folder**: `WAREHOUSE_PATH/enstream/silver/metadata/`
* **Fields**:
  | Column | Data Type | Iceberg Type | Description |
  | :--- | :--- | :--- | :--- |
  | `event_id` | `string` | `string` | Inherited from Bronze layer. |
  | `event_type` | `string` | `string` | Normalized action classification. |
  | `msisdn` | `string` | `string` | Normalized telephone number. |
  | `carrier` | `string` | `string` | Sanitized lowercase network carrier designation. |
  | `imei` | `string` | `string` | Validated 15-digit International Mobile Equipment Identity. |
  | `timestamp` | `double` | `double` | Extracted epoch time of originating occurrence. |
  | `validated_at` | `double` | `double` | Timestamp of validation thread execution. |
  | `dq_passed` | `boolean` | `boolean` | Flag indicating if all quality SLAs passed. |
  | `dq_errors` | `string` | `string` | JSON string array listing errors (e.g. `["MISSING_MSISDN"]`). |
  | `normalized_payload`| `string` | `string` | Standardized payload structure. |

#### 3.1.3 Gold Table Details (Redshift / SQLite OLAP)
* **Logical Name**: `enstream_gold`
* **Storage Provider**: Amazon Redshift (OLAP cluster database).
* **Fields**:
  | Column | Data Type | SQL Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `msisdn` | `VARCHAR(32)` | `PRIMARY KEY` | Normalized target phone number. |
  | `customer_name` | `VARCHAR(256)` | `NULLABLE` | Standardized subscriber name. |
  | `carrier` | `VARCHAR(64)` | `NOT NULL` | Operating subscriber carrier. |
  | `msisdn_age_days` | `INTEGER` | `NOT NULL` | Calculation of days since initial activation. |
  | `port_frequency_30d`| `INTEGER` | `NOT NULL` | Count of porting occurrences in the last 30 days. |
  | `activation_recency_hours` | `DOUBLE PRECISION` | `NOT NULL` | Decimals representing hours since last SIM activation. |
  | `device_churn_count`| `INTEGER` | `NOT NULL` | Unique device count (distinct IMEIs linked). |
  | `fraud_exchange_matches` | `INTEGER` | `NOT NULL` | Occurrence count of blacklist records. |
  | `network_fraud_ring_size` | `INTEGER` | `NOT NULL` | Traversal path distance in shared-hardware graph. |
  | `last_update_time` | `DOUBLE PRECISION` | `NOT NULL` | Epoch timestamp of last gold recalculation. |

---

## 4. Algorithmic Implementations & Logic Flows

### 4.1 Data Quality (DQ) Engine Validation Rules
Every record moving from Bronze to Silver goes through the DQ Validator engine ([quality.py](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/backend/app/quality.py)):

```python
def run_dq_check(payload: dict, source: str) -> (bool, list):
    errors = []
    
    # 1. Schema Validation (Required Fields)
    if not payload.get("msisdn"):
        errors.append("MISSING_MSISDN")
    
    # 2. Completeness Validation
    if source in ["bell", "rogers", "telus"] and not payload.get("imei") and payload.get("event_type") != "msisdn_update":
        errors.append("MISSING_IMEI")
        
    # 3. Uniqueness Validation (Simulated duplication checking against current state memory)
    # 4. Freshness Validation (Occurrence timestamp must not be older than 2 hours)
    event_time = payload.get("timestamp", 0)
    current_time = time.time()
    if current_time - event_time > 7200: # 2 hours in seconds
        errors.append("STALE_EVENT_EXCEEDS_2H_SLA")
        
    # 5. Referential Integrity Check
    msisdn = payload.get("msisdn", "")
    if msisdn and len(msisdn) < 10:
        errors.append("INVALID_MSISDN_FORMAT")
        
    imei = payload.get("imei", "")
    if imei and (len(imei) != 15 or not imei.isdigit()):
        errors.append("INVALID_IMEI_FORMAT")
        
    dq_passed = len(errors) == 0
    return dq_passed, errors
```

---

### 4.2 Network Fraud Ring Detection BFS Graph Algorithm
To identify groups of MSISDNs linked by shared physical hardware, the platform builds an in-memory bipartite graph:

$$\text{Graph } G = (V_{\text{MSISDN}} \cup V_{\text{IMEI}}, E)$$

An edge $e = (m, i) \in E$ exists if MSISDN $m$ has ever been linked to IMEI $i$. The algorithm computes the size of the connected component containing a target subscriber $m^*$:

```python
def calculate_network_ring_size(target_msisdn: str, all_silver_events: list) -> int:
    # Build bidirectional adjacency map
    msisdn_to_imeis = defaultdict(set)
    imei_to_msisdns = defaultdict(set)
    
    for event in all_silver_events:
        if not event.get("dq_passed"):
            continue
        m = event.get("msisdn")
        i = event.get("imei")
        if m and i:
            msisdn_to_imeis[m].add(i)
            imei_to_msisdns[i].add(m)
            
    # Breadth-First Search (BFS) for Connected Component
    queue = [target_msisdn]
    visited_msisdns = {target_msisdn}
    visited_imeis = set()
    
    while queue:
        curr_msisdn = queue.pop(0)
        linked_imeis = msisdn_to_imeis[curr_msisdn]
        for imei in linked_imeis:
            if imei not in visited_imeis:
                visited_imeis.add(imei)
                linked_msisdns = imei_to_msisdns[imei]
                for next_msisdn in linked_msisdns:
                    if next_msisdn not in visited_msisdns:
                        visited_msisdns.add(next_msisdn)
                        queue.append(next_msisdn)
                        
    return len(visited_msisdns)
```

---

### 4.3 Fraud Scoring & Explainability Engine
The risk evaluation engine calculates a final Trust Score $S \in [0, 100]$ based on weights defined in the active model configuration.

```python
# Feature Deductions Mapping in active model
rules_config = {
    "fraud_exchange_matches": {"weight": 60, "direction": -1, "max_deduction": 60},
    "port_frequency_30d": {"weight": 15, "direction": -1, "max_deduction": 30},
    "activation_recency_hours": {"weight": 10, "direction": 1, "threshold_hours": 24, "deduction": 10},
    "device_churn_count": {"weight": 10, "direction": -1, "max_deduction": 20},
    "network_fraud_ring_size": {"weight": 10, "direction": -1, "max_deduction": 50}
}
```

#### 4.3.1 Scoring Formula
Let $F$ represent the calculated feature vector for subscriber $m$:

$$F = [x_1, x_2, x_3, x_4, x_5]$

Where:
* $x_1$: `fraud_exchange_matches` (binary match $0$ or $1$)
* $x_2$: `port_frequency_30d` (integer $\ge 0$)
* $x_3$: `activation_recency_hours` (float $\ge 0.0$)
* $x_4$: `device_churn_count` (integer $\ge 0$)
* $x_5$: `network_fraud_ring_size` (integer $\ge 1$)

The deduction function $D(F)$ subtracts values based on active rules:

$$D_1 = x_1 \times 60$$

$$D_2 = \min\left(30, x_2 \times 15\right)$$

$$D_3 = \begin{cases} 10 & \text{if } x_3 < 24.0 \\ 0 & \text{if } x_3 \ge 24.0 \end{cases}$$

$$D_4 = \min\left(20, \max(0, x_4 - 1) \times 10\right)$$

$$D_5 = \min\left(50, \max(0, x_5 - 1) \times 10\right)$$

The final Trust Score is:

$$S = \max\left(0, 100 - \sum_{k=1}^{5} D_k\right)$$

#### 4.3.2 SHAP Explanation Logic
SHAP values represent the exact contribution of each feature to the difference between the actual score $S$ and the base value $S_{\text{base}} = 100$:

$$\text{SHAP}_k = -D_k$$

The sum of SHAP values matches the score delta:

$$S - S_{\text{base}} = \sum_{k=1}^{5} \text{SHAP}_k$$

This vector is returned in the API and visualized on the frontend as horizontal bars to explain risk allocations.

---

### 4.4 MLOps Population Stability Index (PSI) Drift Monitor
To detect training feature shift over time, the system compares current evaluation data against a baseline dataset. The scoring distribution is partitioned into $K=5$ risk buckets:

$$\text{Buckets} = \{ [0,20], (20,40], (40,60], (60,80], (80,100] \}$$

For each bucket $i$:
1. $E_i$ (Expected Proportion): Ratio of baseline training set scores in bucket $i$.
2. $A_i$ (Actual Proportion): Ratio of live evaluation scores in bucket $i$.

The mathematical formulation of PSI is:

$$\text{PSI} = \sum_{i=1}^{5} \left( (A_i - E_i) \times \ln\left(\frac{A_i + \epsilon}{E_i + \epsilon}\right) \right)$$

*where $\epsilon = 1e-5$ is a smoothing factor to prevent division by zero.*

```python
def calculate_psi(baseline_scores: list, current_scores: list) -> float:
    # 1. Define bucket limits
    bins = [0, 20, 40, 60, 80, 100]
    
    # 2. Calculate counts per bucket
    expected_counts, _ = np.histogram(baseline_scores, bins=bins)
    actual_counts, _ = np.histogram(current_scores, bins=bins)
    
    # 3. Convert to ratios (proportions)
    expected_ratios = expected_counts / len(baseline_scores)
    actual_ratios = actual_counts / len(current_scores)
    
    # 4. Sum index values
    psi = 0.0
    epsilon = 1e-5
    for a, e in zip(actual_ratios, expected_ratios):
        # Smooth ratios
        a_s = a + epsilon
        e_s = e + epsilon
        psi += (a - e) * np.log(a_s / e_s)
        
    return psi
```

---

## 5. Deployment Framework Configurations

The code operates in a **Hybrid Mode** that allows running locally for development and switching to AWS cloud services via environment variables.

### 5.1 Environment Variables Matrix

| Environment Variable | Local Mode Default | AWS Cloud Production Value |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | `None` (Inactive) | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY`| `None` (Inactive) | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`|
| `AWS_REGION` | `us-east-1` | `ca-central-1` |
| `WAREHOUSE_PATH` | `./warehouse` | `s3://enstream-fraud-lakehouse/warehouse` |
| `REDSHIFT_CONN_STR` | `None` (SQL locally) | `redshift://cluster-user:password@endpoint:5439/gold_db` |

---

### 5.2 Storage Connection Architectures

#### 5.2.1 S3 / Apache Iceberg PyArrow Adapter
In S3 Storage mode, file creation uses the `s3fs` library to interact with S3. Parquet metadata and datasets are written using custom partition pathways:

```python
# Segment from backend/app/medallion.py
if WAREHOUSE_PATH.startswith("s3://"):
    import s3fs
    s3_fs = s3fs.S3FileSystem(
        key=os.getenv("AWS_ACCESS_KEY_ID"),
        secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
        client_kwargs={"region_name": AWS_REGION}
    )
```

For every transaction write:
1. Dataframes are converted to `pyarrow.Table`.
2. Written to S3:
   ```python
   with s3_fs.open(f"{WAREHOUSE_PATH}/enstream/bronze/data/dt=YYYY-MM-DD/file.parquet", "wb") as f:
       pq.write_table(table, f)
   ```
3. A JSON Iceberg metadata file maps the manifest list index:
   ```python
   with s3_fs.open(f"{WAREHOUSE_PATH}/enstream/bronze/metadata/v1.metadata.json", "w") as f:
       json.dump(metadata_payload, f)
   ```

#### 5.2.2 Redshift OLAP Adapter
Aggregate client gold profiles are uploaded to Redshift using a connection adapter:

```python
# Connection workflow in backend/app/medallion.py
if REDSHIFT_CONN_STR:
    import redshift_connector
    
    # Parse Redshift URI: redshift://user:pass@host:5439/db
    conn = redshift_connector.connect(
        host=host_endpoint,
        database=db_name,
        user=user_name,
        password=password,
        port=5439
    )
    cursor = conn.cursor()
    # Execute batch UPSERT statements onto redshift cluster database
```

---

## 6. Frontend Module Interface Flow

The frontend is structured as a single-page React application using Tailwind CSS. 

### 6.1 State Management and SSE Syncing
[App.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/App.tsx) coordinates real-time status updates via a `EventSource` connection to the backend `/api/stream` endpoint:

```
[FastAPI SSE Broadcaster] (8000)
       │
       ├─► [kafka_event] ────► (Appends events to local logs state array)
       │
       ├─► [silver_processed] ► (Refreshes Medallion counts, DQ rates, and state metrics)
       │
       └─► [score_refreshed] ──► (Updates profile state details if selected entity matches)
```

This updates state matrices across frontend components:
* **[ExecutiveDashboard.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/ExecutiveDashboard.tsx)**: Displays aggregate stats, distribution charts, and a visual graph representation of the fraud ring.
* **[OperationsConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/OperationsConsole.tsx)**: Simulates a live CLI console showing raw event stream logs.
* **[DataPlatformConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/DataPlatformConsole.tsx)**: Maps data lineage across the Bronze, Silver, and Gold layers.
* **[DQMonitoringConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/DQMonitoringConsole.tsx)**: Tracks DQ pass rates and quarantined items.
* **[MLPlatformConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/MLPlatformConsole.tsx)**: Displays model logs, PSI values, and drift charts.
* **[FraudInvestigationConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/FraudInvestigationConsole.tsx)**: Displays details for queried MSISDNs, showcasing scores and SHAP explainability.
* **[RealTimeMonitor.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/RealTimeMonitor.tsx)**: Provides manual inputs to trigger events and displays pipeline execution animations.
* **[DataExchangeConsole.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/DataExchangeConsole.tsx)**: Implements the Cross-Sector Bad Actor Data Exchange MVP (ingestion drops, PII masking/unmasking, and lookup recycle-checking).
* **[TechnicalArchitecture.tsx](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/components/TechnicalArchitecture.tsx)**: Visualizes the 5-phase target architecture roadmap, vendor scaling constraints, orchestration trade-offs, low-latency caching specs, and exposes an interactive **Partner API Sandbox** (simulating all 13 standard APIs: A1, A2, A3, A4, A5, A6, D1 V1, D1 V2, D1 Retrieval, D2, D3, D3M, D4, D5, D6 under the Release 2.0 v1.38 Integration specifications, Basic Auth and Jakarta User-Agent headers, response code explanations, and JOSE JWS/JWE encryption).

---

## 7. System Architecture & Transition Roadmap

### 7.1 5-Phase Transition Timeline
The transition from legacy systems to the modern cloud-native EnStream platform is structured across 5 distinct phases, each gated by strict acceptance criteria:
1. **Phase 1: Batch Operationalized (End-June)**: Inherits as-is operational setup. Incremental batch data loading from MySQL reporting DB to S3 Bronze layer.
   * *Acceptance Gate*: Score output matches PoC holdout data. Database reads are fully idempotent.
2. **Phase 2: Batch Automated (Early-July)**: Orchestration via MWAA/Airflow. Complete schema monitoring and alerting configurations.
   * *Acceptance Gate*: Ingestion pipelines run on schedule meeting SLA limits. Zero score drift. Rollback drills completed.
3. **Phase 3: Interim Real-Time (End-August)**: Real-time queries served via Kinesis MSK indexing and Flink streaming from IDV database.
   * *Acceptance Gate*: P95 latency is under 2s, P99 is under 5s. Automatic failover to last batch score on failure.
4. **Phase 4: Source-Direct Real-Time (End-December)**: Direct carrier streaming feeds via Flink. Retire IDV databases.
   * *Acceptance Gate*: Raw event transit latency is under 2s. Support for full historical event replay.
5. **Phase 5: Continuous Everything (Continuous)**: Active data drift monitoring, automated ML retraining pipelines, and validation gates.
   * *Acceptance Gate*: Automatic rollbacks triggered if drift thresholds are breached.

### 7.2 Scaling Requirements & Orchestration Trade-offs

### 7.2.1 Low-Latency Caching Architecture
To support **1,000,000 to 5,000,000 real-time scoring requests/day** (peak ~500 QPS) and meet sub-second SLAs (< 100ms) over 30M profiles, we isolate the transactional scoring pathway from the Redshift gold layer using an event-driven cache:
- **Amazon ElastiCache (Redis)**: In-Memory Score Cache (Latency: < 10ms)
- **Amazon DynamoDB**: Active Feature Store (Latency: < 50ms)
- **Dirty Flag Invalidation**: Telemetry arrivals raise a "dirty flag," bypassing the cache and triggering a single-entity feature refresh from DynamoDB.
- **OLAP Isolation**: BFS graph ring traversal and Redshift queries are isolated from live user API routes.

### 7.2.2 Caching Telemetry & Interactive Simulation
To demonstrate performance SLA compliance, the Partner API Sandbox UI exposes an interactive caching playground simulating three distinct execution routes:
1. **Auto (Redis Hit)**: The client query hits the Redis keyspace. Pre-computed features are retrieved in **3ms - 8ms**, bypassing any query overhead in S3 or Redshift.
2. **Bypass (Dirty Flag)**: Occurs when a telemetry event has updated conformed data within the 2-minute batch drop window. Bypasses the cache to query DynamoDB active feature store, Promotes features and updates the Redis keyspace. Latency resolves in **40ms - 75ms**.
3. **Cold DB Fallback (Cache Miss)**: Occurs on cold starts or expired TTL keys. The system falls back to scan conformed records across the 30M profile database in S3 Gold Iceberg format. Latency is simulated at **150ms - 240ms**.
* **Data Scale Parameters**:
  - Inherited MySQL DB: **1.0 TB** size, growing at **7 GB/day**.
  - Ingestion stream rate: **400 events/second** ingress (excluding Roger's file drops).
  - Target query capacity: **1,000,000 requests/day** initially, scaling to **5,000,000 requests/day** at steady state.
* **Orchestration Decisions**:
  - **AWS Managed Airflow (MWAA)**: Used for Phase 1/2 batch aggregation and Gold table refreshes. Provides robust python native logic and retry tracing.
  - **AWS Step Functions**: Used for Phase 3/4 low-latency API scoring routes. Delivers sub-second serverless execution without container spin-up overhead.

### 7.4 Phase-Wise Architectural Evolution

To ensure a low-risk, cost-efficient path to our Northstar architecture, the platform's systems, streaming engines, and caching layers evolve phase-by-phase:

```mermaid
flowchart TD
    subgraph Phase 1-2: Batch Baseline
        MySQL[(Legacy MySQL DB)] -->|Nightly EMR Spark| S3_Bronze[S3 Bronze Table]
        S3_Bronze -->|Glue Spark Promo| S3_Silver[S3 Silver Table]
        S3_Silver -->|Gold Promo| Redshift[(Redshift Gold Table)]
        MWAA[Airflow MWAA] -->|Orchestrate Batch| S3_Bronze & S3_Silver & Redshift
    end

    subgraph Phase 3: Interim Real-Time
        Webhooks[API Gateways / Webhooks] -->|Stream events| Kinesis[AWS Kinesis Streams]
        Kinesis -->|Trigger event-by-event| Lambda[AWS Lambda Functions]
        Lambda -->|1. Write raw| S3_Bronze
        Lambda -->|2. Update features| DynamoDB[(DynamoDB Feature Store)]
        Lambda -->|3. Evict cache| Redis[(Redis Cache)]
        Gateway[API Gateway / Step Functions] -->|Serve 13 APIs| Redis
        Redis -->|On Miss| DynamoDB
        DynamoDB -->|On Miss| Redshift
    end

    subgraph Phase 4: Enterprise Real-Time
        Carriers[Rogers, Bell, Telus Logs] -->|Direct streaming| Flink[Apache Flink CEP]
        Flink -->|Stateful rolling windows| DynamoDB
        Flink -->|Invalidate keys| Redis
    end
```

#### 7.4.1 Phase 1 & 2: Batch Baseline (Operationalized & Automated)

![Phase 1 & 2 Batch Baseline Architecture](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/enstream_phase_1_2_batch_architecture_1781697963641.png)
- **Data Flow**: Incremental batch extracts read conformed API requests and customer-journey events from the legacy **1.0 TB MySQL reporting database**.
- **Ingestion & Promotion**: Scheduled **EMR Spark** and **AWS Glue** tasks write raw Parquet records to `enstream_bronze`, validate formatting rules (completeness, E.164 E-mail/Phone formats), promote conformed rows to `enstream_silver`, and compile analytical aggregates into `enstream_gold` (Redshift Serverless).
- **Orchestration & Quality**: Orchestrated using **AWS Managed Workflows for Apache Airflow (MWAA)**. Introduces the automated Data Quality SLA audit ledger and quarantine logs, alongside SageMaker PSI drift monitoring.
- **Serving Path**: All API queries read pre-calculated scores directly from the analytical Gold tables, resolving within normal batch database latencies (> 150ms).

#### 7.4.2 Phase 3: Interim Real-Time (Serverless Streaming)

![Phase 3 Serverless Real-Time Ingest Architecture](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/enstream_phase_3_serverless_architecture_1781697979300.png)
- **Objectives**: Enable sub-second API scoring and support the **13 standard REST developer APIs** (A1-A6, D1-D6) defined in the v1.38 Integration Guide.
- **Streaming Path**: Telco CRM triggers, transaction updates, and webhook callbacks publish events into **Amazon Kinesis Data Streams**.
- **Serverless Ingestion**: An **AWS Lambda function** is triggered by Kinesis stream shards. Lambda validates JSON schemas, writes the raw telemetry to the S3 Bronze table, updates conformed feature attributes in **Amazon DynamoDB** (acting as our Active Feature Store), and raises a "dirty flag" in our **Redis Cache**.
- **Transactional Serving**: API Gateway and AWS Step Functions serve the 13 APIs. The query checks the **Amazon ElastiCache (Redis)** keyspace first, resolving cache hits in **< 10ms**. On a cache miss, it reads features from DynamoDB (< 50ms) or defaults to the last nightly batch score in Redshift.

#### 7.4.3 Phase 4: Source-Direct Real-Time (Enterprise Streaming)

![Phase 4 Stateful Enterprise Ingest Architecture](C:/Users/anil.saini/.gemini/antigravity/brain/3412829a-4992-454d-bbe4-236f42150bba/enstream_phase_4_enterprise_architecture_1781697995752.png)
- **Objectives**: Transition to direct, low-latency carrier streaming feeds (Rogers, Bell, Telus) and support complex, stateful event correlations.
- **Stateful Processing**: **Apache Flink (Kinesis Data Analytics)** replaces Lambda for the streaming path. Flink maintains rolling time windows in-memory (RocksDB state backend) to check complex correlations, such as SIM swap velocities (checking for $\ge 3$ card updates within 2 hours) and graph ring network sizes across shared IMEIs.
- **Serving Path**: Flink writes verified feature updates to DynamoDB and evicts expired keys from Redis. The caching serving pathway remains identical to Phase 3, guaranteeing under-10ms response times for the active subscriber keyspace.
- **Lineage Consolidation**: AWS Glue Spark batch jobs continue running in the background to compile conformed lineage logs and promotion aggregates.

#### 7.4.4 Phase 5: Continuous Everything (Autonomous ML & Bad Actor Exchange)
- **ML Automation**: Automated retraining pipelines execute on SageMaker if model PSI drifts beyond 0.2.
- **Exchange Hub**: The **Cross-Sector Bad Actor Data Exchange Hub** goes live, integrating participant blacklists (Incedo, Rogers, Bell, Telus, TransUnion) and exposing secure lookup routes with automatic RBAC-based PII masking.

### 7.3 Strategic Competitive Advantage & Alignment
* **Parity with Subex ML Bad Actor Proposal**:
  - Subex proposed moving the customer's entire database to their external **Fraudzap** system for offline processing.
  - EnStream provides equal classification power while keeping data secure and resident. Models run directly within containerized tasks in the S3 Medallion storage ecosystem, maintaining full data sovereignty.
* **Legacy Integrators (Wipro / Tech Mahindra)**:
  - Traditional integrators propose black-box architectures built on closed databases, causing vendor lock-in and high maintenance costs.
  - EnStream utilizes **open-table formats (Apache Iceberg)**, making features and lineage accessible to any analytics engine, while selective dirty-flag score recalculations reduce infrastructure overhead.
