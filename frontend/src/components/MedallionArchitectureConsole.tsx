import { BACKEND_URL } from "../config";
import React, { useState } from "react";
import { 
  Database, GitMerge, FileText, Settings, Search, Filter, 
  ArrowRight, ShieldCheck, Cpu, HardDrive, Info, Link, Check, HelpCircle
} from "lucide-react";

export default function MedallionArchitectureConsole() {
  const [activeSubTab, setActiveSubTab] = useState<"erd" | "dictionary" | "pipelines" | "enrichment" | "storage">("erd");
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictionaryFilter, setDictionaryFilter] = useState<"all" | "bronze" | "silver" | "gold" | "quarantine">("all");
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<string | null>(null);
  const [selectedPipelineStep, setSelectedPipelineStep] = useState<number>(0);

  // ERD schema definitions
  const erdTables = {
    bronze: {
      name: "enstream.bronze",
      title: "Bronze: Raw Landing Zone (Iceberg / Parquet)",
      color: "border-blue-500 bg-blue-950/20 text-blue-400",
      icon: <Database className="w-4 h-4 text-blue-400" />,
      columns: [
        { name: "event_id", type: "string (UUID)", key: "PK", desc: "Logical PK. Unique transaction ingestion ID." },
        { name: "event_type", type: "string", key: "", desc: "Event classification (activation, porting, etc)." },
        { name: "msisdn", type: "string", key: "FK", desc: "Target telephone number (maps to Gold/Silver)." },
        { name: "payload", type: "string (JSON)", key: "", desc: "Raw JSON string received from carrier hooks." },
        { name: "source", type: "string", key: "", desc: "Originating ingest provider (bell, rogers, mysql, etc)." },
        { name: "ingested_at", type: "double (Epoch)", key: "", desc: "Timestamp when committed to Bronze storage." }
      ]
    },
    silver: {
      name: "enstream.silver",
      title: "Silver: Cleansed & Validated (Iceberg / Parquet)",
      color: "border-emerald-500 bg-emerald-950/20 text-emerald-400",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      columns: [
        { name: "event_id", type: "string (UUID)", key: "FK", desc: "Links directly back to Bronze event row." },
        { name: "event_type", type: "string", key: "", desc: "Normalized event classification." },
        { name: "msisdn", type: "string", key: "FK", desc: "Cleaned E.164 phone format identifier." },
        { name: "carrier", type: "string", key: "", desc: "Sanitized lowercase provider designation." },
        { name: "imei", type: "string", key: "FK", desc: "Validated 15-digit mobile device IMEI serial." },
        { name: "timestamp", type: "double (Epoch)", key: "", desc: "Occurrence timestamp of the event." },
        { name: "validated_at", type: "double (Epoch)", key: "", desc: "Timestamp when DQ checks executed." },
        { name: "dq_passed", type: "boolean", key: "", desc: "True if schema/completeness assertions passed." },
        { name: "dq_errors", type: "string (JSON)", key: "", desc: "Array of DQ errors (if dq_passed = false)." },
        { name: "normalized_payload", type: "string (JSON)", key: "", desc: "Standardized event schema payload." }
      ]
    },
    quarantine: {
      name: "enstream.quarantine",
      title: "Quarantine: Error Dead-Letter (Parquet)",
      color: "border-rose-500 bg-rose-955/20 text-rose-455",
      icon: <Info className="w-4 h-4 text-rose-400" />,
      columns: [
        { name: "event_id", type: "string (UUID)", key: "FK", desc: "Bronze event ID which failed validation." },
        { name: "msisdn", type: "string", key: "", desc: "Raw telephone number extracted." },
        { name: "source", type: "string", key: "", desc: "Originating ingest source provider." },
        { name: "raw_payload", type: "string (JSON)", key: "", desc: "Full raw stringified event payload." },
        { name: "validation_errors", type: "string (JSON)", key: "", desc: "DQ validations that failed." },
        { name: "failed_at", type: "double (Epoch)", key: "", desc: "Timestamp when routed to quarantine." }
      ]
    },
    gold: {
      name: "enstream_gold",
      title: "Gold: Analytical Features (Redshift / OLAP)",
      color: "border-amber-500 bg-amber-955/20 text-amber-400",
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      columns: [
        { name: "msisdn", type: "string (PK)", key: "PK", desc: "Cleaned phone number. Primary Key." },
        { name: "customer_name", type: "string", key: "", desc: "Standardized customer name synced via CDC binlogs." },
        { name: "carrier", type: "string", key: "", desc: "Operating provider network." },
        { name: "msisdn_age_days", type: "long", desc: "Days elapsed since initial activation." },
        { name: "port_frequency_30d", type: "long", desc: "Inter-carrier port requests in past 30 days." },
        { name: "activation_recency_hours", type: "double", desc: "Hours since last SIM activation." },
        { name: "device_churn_count", type: "long", desc: "Distinct device IMEIs associated with this MSISDN." },
        { name: "fraud_exchange_matches", type: "long", desc: "Count of listings in SFTP blacklist exchange databases." },
        { name: "network_fraud_ring_size", type: "long", desc: "Count of shared-device nodes in connection graph." },
        { name: "last_update_time", type: "double (Epoch)", desc: "Timestamp of last feature compilation." }
      ]
    }
  };

  // Data Dictionary rows list
  const dataDictionary = [
    // Bronze
    { layer: "Bronze", table: "enstream.bronze", field: "event_id", type: "string (UUID)", key: "Logical PK", rule: "Auto-generated UUIDv4", desc: "Unique transaction identifier generated at ingestion edge." },
    { layer: "Bronze", table: "enstream.bronze", field: "event_type", type: "string", key: "", rule: "Raw Mapping", desc: "Nature of transaction event (e.g. activation, porting, device_update)." },
    { layer: "Bronze", table: "enstream.bronze", field: "msisdn", type: "string", key: "Logical FK", rule: "Raw Mapping", desc: "Subscriber telephone number as received from ingest source." },
    { layer: "Bronze", table: "enstream.bronze", field: "payload", type: "string (JSON)", key: "", rule: "JSON Stringify", desc: "Stringified JSON block containing the complete payload." },
    { layer: "Bronze", table: "enstream.bronze", field: "source", type: "string", key: "", rule: "Ingress Origin", desc: "Originating ingest provider channel (e.g. bell, rogers, mysql, sftp)." },
    { layer: "Bronze", table: "enstream.bronze", field: "ingested_at", type: "double (Epoch)", key: "", rule: "System Clock", desc: "Epoch timestamp mapping transaction commit to Bronze layer." },

    // Silver
    { layer: "Silver", table: "enstream.silver", field: "event_id", type: "string (UUID)", key: "Logical FK", rule: "Bronze event_id", desc: "Unique event identifier linked back to the Bronze layer raw event." },
    { layer: "Silver", table: "enstream.silver", field: "event_type", type: "string", key: "", rule: "Bronze event_type", desc: "Normalized event classification string." },
    { layer: "Silver", table: "enstream.silver", field: "msisdn", type: "string", key: "Logical FK", rule: "E.164 Cleansing", desc: "Cleaned and standardized E.164 phone format identifier." },
    { layer: "Silver", table: "enstream.silver", field: "carrier", type: "string", key: "", rule: "Lookup & Lowercase", desc: "Sanitized lowercase provider designation (e.g. bell, rogers, telus)." },
    { layer: "Silver", table: "enstream.silver", field: "imei", type: "string", key: "Logical FK", rule: "Regex Extracted", desc: "Cleaned 15-digit mobile device identification serial (IMEI)." },
    { layer: "Silver", table: "enstream.silver", field: "timestamp", type: "double (Epoch)", key: "", rule: "Event Time or Ingest", desc: "Occurrence timestamp of the event." },
    { layer: "Silver", table: "enstream.silver", field: "validated_at", type: "double (Epoch)", key: "", rule: "System Clock", desc: "Timestamp when DQ checks were performed." },
    { layer: "Silver", table: "enstream.silver", field: "dq_passed", type: "boolean", key: "", rule: "DQ Assessment", desc: "True if schema/completeness assertions passed." },
    { layer: "Silver", table: "enstream.silver", field: "dq_errors", type: "string (JSON)", key: "", rule: "DQ Assessment", desc: "JSON array detailing failure flags (e.g., INVALID_IMEI_FORMAT)." },
    { layer: "Silver", table: "enstream.silver", field: "normalized_payload", type: "string (JSON)", key: "", rule: "Deduplicated Schema", desc: "Cleaned JSON document payload representing the normalized event." },

    // Quarantine
    { layer: "Quarantine", table: "enstream.quarantine", field: "event_id", type: "string (UUID)", key: "Logical FK", rule: "Bronze event_id", desc: "Bronze event ID that failed validation checks." },
    { layer: "Quarantine", table: "enstream.quarantine", field: "msisdn", type: "string", key: "", rule: "Raw Extract", desc: "Raw phone number from failed payload." },
    { layer: "Quarantine", table: "enstream.quarantine", field: "source", type: "string", key: "", rule: "Raw Extract", desc: "Failed ingest source gateway." },
    { layer: "Quarantine", table: "enstream.quarantine", field: "raw_payload", type: "string (JSON)", key: "", rule: "Raw copy", desc: "Full raw stringified event payload that caused validation failure." },
    { layer: "Quarantine", table: "enstream.quarantine", field: "validation_errors", type: "string (JSON)", key: "", rule: "DQ Assessment", desc: "JSON array listing validation error messages." },
    { layer: "Quarantine", table: "enstream.quarantine", field: "failed_at", type: "double (Epoch)", key: "", rule: "System Clock", desc: "Timestamp when routed to the quarantine storage queue." },

    // Gold
    { layer: "Gold", table: "enstream_gold", field: "msisdn", type: "string", key: "Primary Key", rule: "Silver unique msisdn", desc: "Normalized E.164 phone number. Primary identifier." },
    { layer: "Gold", table: "enstream_gold", field: "customer_name", type: "string", key: "", rule: "MySQL CDC Join", desc: "Standardized customer name synced via CDC binlogs." },
    { layer: "Gold", table: "enstream_gold", field: "carrier", type: "string", key: "", rule: "Latest silver carrier", desc: "Last registered operating provider network." },
    { layer: "Gold", table: "enstream_gold", field: "msisdn_age_days", type: "long", rule: "Ingest relative date", desc: "Days elapsed since the telephone number's initial carrier activation." },
    { layer: "Gold", table: "enstream_gold", field: "port_frequency_30d", type: "long", rule: "Window count 30d", desc: "Count of inter-carrier porting requests in past 30 days." },
    { layer: "Gold", table: "enstream_gold", field: "activation_recency_hours", type: "double", rule: "Relative age calculation", desc: "Hours elapsed since last SIM activation event." },
    { layer: "Gold", table: "enstream_gold", field: "device_churn_count", type: "long", rule: "Distinct IMEI count", desc: "Count of distinct device IMEIs linked to this MSISDN in Silver logs." },
    { layer: "Gold", table: "enstream_gold", field: "fraud_exchange_matches", type: "long", rule: "SFTP list match count", desc: "Occurrence count in SFTP blacklist exchange databases." },
    { layer: "Gold", table: "enstream_gold", field: "network_fraud_ring_size", type: "long", rule: "BFS Component Traversal", desc: "Count of telephone numbers in device-sharing network graph." },
    { layer: "Gold", table: "enstream_gold", field: "last_update_time", type: "double (Epoch)", key: "", rule: "System Clock", desc: "Epoch timestamp of last OLAP aggregate feature write." }
  ];

  // Transformation pipelines steps
  const pipelineSteps = [
    {
      title: "Bronze Ingestion Landing",
      trigger: "Real-time webhook post or file arrival",
      action: "Appends raw payloads in JSON to partition structures.",
      rules: [
        "Checks event for an existing event_id; generates UUID if missing.",
        "Saves original source timestamp and network channel metadata.",
        "Writes append-only format directly into S3 Parquet warehouse: enstream/bronze/data/ingested_at=H/file.parquet."
      ],
      code: `# Python - app/medallion.py (write_to_bronze)
def write_to_bronze(event: dict, source: str) -> dict:
    bronze_rec = {
        "event_id": event.get("event_id", str(uuid.uuid4())),
        "event_type": event.get("event_type", "unknown"),
        "msisdn": event.get("msisdn", ""),
        "payload": json.dumps(event),
        "source": source,
        "ingested_at": time.time()
    }
    df = pd.DataFrame([bronze_rec])
    # Writes parquet file + commits new Apache Iceberg metadata json
    write_data_file(df, "enstream/bronze/data/...")`
    },
    {
      title: "Bronze ➔ Silver (Normalization & DQ SLA Verification)",
      trigger: "Triggered continuously (micro-batch) or on Bronze file commits",
      action: "Runs schema/format checks. Normalizes phone numbers. Separates dirty data.",
      rules: [
        "Executes data quality validator constraints (E.164 formatting, 15-digit IMEI verification).",
        "Validates freshness SLA: alerts if event latency exceeds 2 hours.",
        "If DQ checks PASS: parses raw JSON, lowercases carrier names, and appends to Silver Iceberg table.",
        "If DQ checks FAIL: logs errors, wraps raw payload, and redirects records to Quarantine Parquet paths."
      ],
      code: `# Python - app/medallion.py (process_bronze_to_silver)
for item in unprocessed_bronze:
    raw_payload = json.loads(item["payload"])
    dq_passed, dq_errors = run_dq_check(raw_payload, item["source"])
    
    if dq_passed:
        # Commit to Cleaned Silver Table
        silver_rec = { ... }
        write_data_file(pd.DataFrame([silver_rec]), "enstream/silver/data/...")
    else:
        # Route to Quarantine dead-letter log
        quarantine_rec = {
            "event_id": item["event_id"],
            "validation_errors": json.dumps(dq_errors), ...
        }
        write_data_file(pd.DataFrame([quarantine_rec]), "enstream/quarantine/...")`
    },
    {
      title: "Silver ➔ Gold (OLAP Aggregation & BFS Graph Construction)",
      trigger: "Triggered periodically or on dirty flag updates",
      action: "Runs network graphs and window aggregations. Writes to Amazon Redshift (OLAP).",
      rules: [
        "Scans all validated Silver events to build bipartite MSISDN ➔ IMEI associations.",
        "Traverses hardware relations via Breadth-First Search (BFS) to identify network fraud rings.",
        "Calculates 30-day inter-carrier port request frequency counts.",
        "Counts unique device hardware associations (SIM swaps / device churn rate).",
        "Executes UPSERT (MERGE) commands into enstream_gold database table."
      ],
      code: `# SQL / Python - app/features.py (incremental_compute)
def compute_gold_features(target_msisdn: str):
    # 1. Traverses device-sharing BFS component to compute Ring Size
    ring_size = calculate_network_ring_size(target_msisdn, silver_events)
    
    # 2. Aggregates device history and activation timelines
    port_count_30d = count_ports_last_30d(target_msisdn, silver_events)
    device_churn = count_unique_imeis(target_msisdn, silver_events)
    
    # 3. Executes UPSERT into Redshift / SQLite
    conn.execute("""
        INSERT INTO enstream_gold (...) VALUES (...)
        ON CONFLICT(msisdn) DO UPDATE SET ...
    """)`
    }
  ];

  // Filtering data dictionary
  const filteredDictionary = dataDictionary.filter(row => {
    const matchesSearch = row.field.toLowerCase().includes(dictionarySearch.toLowerCase()) || 
                          row.desc.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
                          row.table.toLowerCase().includes(dictionarySearch.toLowerCase());
    
    const matchesFilter = dictionaryFilter === "all" || 
                          row.layer.toLowerCase() === dictionaryFilter;
                          
    return matchesSearch && matchesFilter;
  });

  // Check if a cell should highlight based on hovered relation
  const shouldHighlightRow = (tableName: string, columnName: string) => {
    if (!hoveredRelation) return false;
    
    if (hoveredRelation === "bronze-silver") {
      return (tableName === "enstream.bronze" && columnName === "event_id") ||
             (tableName === "enstream.silver" && columnName === "event_id");
    }
    if (hoveredRelation === "bronze-quarantine") {
      return (tableName === "enstream.bronze" && columnName === "event_id") ||
             (tableName === "enstream.quarantine" && columnName === "event_id");
    }
    if (hoveredRelation === "silver-gold") {
      return (tableName === "enstream.silver" && columnName === "msisdn") ||
             (tableName === "enstream_gold" && columnName === "msisdn");
    }
    if (hoveredRelation === "silver-gold-imei") {
      return (tableName === "enstream.silver" && columnName === "imei") ||
             (tableName === "enstream_gold" && columnName === "network_fraud_ring_size");
    }
    return false;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center">
            <GitMerge className="w-5 h-5 mr-2 text-blue-500" />
            Medallion Architecture Spec & Data Models
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Technical schemas, field levels, entity relationships, and transition rules defining the lakehouse stages.
          </p>
        </div>

        {/* Sub-tabs Selection */}
        <div className="flex bg-slate-955 p-1 rounded-lg border border-slate-800 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("erd")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "erd" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            ERD & Data Models
          </button>
          <button
            onClick={() => setActiveSubTab("dictionary")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "dictionary" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Dictionary
          </button>
          <button
            onClick={() => setActiveSubTab("pipelines")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "pipelines" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Transition Pipelines
          </button>
          <button
            onClick={() => setActiveSubTab("enrichment")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "enrichment" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Enrichment
          </button>
          <button
            onClick={() => setActiveSubTab("storage")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "storage" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Storage & Catalog Specs
          </button>
        </div>
      </div>

      {/* ERD VIEW */}
      {activeSubTab === "erd" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-3 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <Link className="w-4 h-4 mr-2 text-blue-500" />
                  Traditional Entity-Relationship Diagram (Crow's Foot Notation)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hover over the connection lines or primary key/foreign key labels to analyze schema constraints, validation mappings, and keys lineage.
                </p>
              </div>

              {/* Status Info Board */}
              <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex items-center space-x-3 text-xs shrink-0 h-10 select-none">
                <span className="text-slate-500 font-mono font-bold">Relational Tooltip:</span>
                <span className="text-slate-300 font-sans">
                  {hoveredRelation === "bronze-silver" && "Bronze event_id ➔ Silver event_id (1-to-0..1 Cleaned split)"}
                  {hoveredRelation === "bronze-quarantine" && "Bronze event_id ➔ Quarantine event_id (1-to-0..1 Error split)"}
                  {hoveredRelation === "silver-gold" && "Silver msisdn ➔ Gold msisdn (Many-to-1 Profile Aggregation)"}
                  {hoveredRelation === "silver-gold-imei" && "Silver imei ➔ Gold network_fraud_ring_size (Many-to-Many Hardware Graph Component)"}
                  {!hoveredRelation && "Hover over relationship lines to trace keys details"}
                </span>
              </div>
            </div>

            {/* Traditional ERD Canvas Container */}
            <div className="overflow-x-auto pb-4 pt-1">
              <div className="w-[1020px] h-[550px] relative bg-slate-950/45 rounded-xl border border-slate-850 select-none mx-auto overflow-hidden">
                
                {/* SVG Connections Canvas */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    {/* Definition for One-and-Only-One marker (perpendicular lines) */}
                    <marker id="one-and-only" markerWidth="20" markerHeight="20" refX="14" refY="10" orient="auto">
                      <line x1="8" y1="4" x2="8" y2="16" stroke="#3b82f6" strokeWidth="2" />
                      <line x1="12" y1="4" x2="12" y2="16" stroke="#3b82f6" strokeWidth="2" />
                    </marker>

                    {/* Definition for Zero-or-One marker (circle + perpendicular line) */}
                    <marker id="zero-or-one-emerald" markerWidth="20" markerHeight="20" refX="6" refY="10" orient="auto">
                      <circle cx="12" cy="10" r="3.5" fill="#020617" stroke="#10b981" strokeWidth="1.8" />
                      <line x1="4" y1="4" x2="4" y2="16" stroke="#10b981" strokeWidth="1.8" />
                    </marker>

                    <marker id="zero-or-one-rose" markerWidth="20" markerHeight="20" refX="6" refY="10" orient="auto">
                      <circle cx="12" cy="10" r="3.5" fill="#020617" stroke="#f43f5e" strokeWidth="1.8" />
                      <line x1="4" y1="4" x2="4" y2="16" stroke="#f43f5e" strokeWidth="1.8" />
                    </marker>

                    {/* Definition for Zero-or-Many (Circle + Crow's foot fork) */}
                    <marker id="zero-or-many-amber" markerWidth="24" markerHeight="20" refX="6" refY="10" orient="auto">
                      <circle cx="16" cy="10" r="3.5" fill="#020617" stroke="#d97706" strokeWidth="1.8" />
                      <path d="M 8 10 L 0 4 M 8 10 L 0 16 M 8 10 L 0 10" stroke="#d97706" strokeWidth="1.8" fill="none" />
                    </marker>

                    {/* Definition for Many-to-Many logical link (Fork with circle) */}
                    <marker id="zero-or-many-purple" markerWidth="24" markerHeight="20" refX="6" refY="10" orient="auto">
                      <circle cx="16" cy="10" r="3.5" fill="#020617" stroke="#a855f7" strokeWidth="1.8" />
                      <path d="M 8 10 L 0 4 M 8 10 L 0 16 M 8 10 L 0 10" stroke="#a855f7" strokeWidth="1.8" fill="none" />
                    </marker>
                  </defs>

                  {/* 1. Bronze event_id ➔ Silver event_id (1-to-0..1 validation curve) */}
                  <path 
                    d="M 270 95 C 320 95, 320 225, 380 225" 
                    fill="none" 
                    stroke={hoveredRelation === "bronze-silver" ? "#3b82f6" : "#3b82f6/45"} 
                    strokeWidth={hoveredRelation === "bronze-silver" ? "3" : "1.8"} 
                    markerStart="url(#one-and-only)"
                    markerEnd="url(#zero-or-one-emerald)"
                    className="transition-all duration-200"
                  />

                  {/* 2. Bronze event_id ➔ Quarantine event_id (1-to-0..1 error curve) */}
                  <path 
                    d="M 270 95 C 330 130, 330 365, 270 395" 
                    fill="none" 
                    stroke={hoveredRelation === "bronze-quarantine" ? "#f43f5e" : "#f43f5e/45"} 
                    strokeWidth={hoveredRelation === "bronze-quarantine" ? "3" : "1.8"} 
                    markerStart="url(#one-and-only)"
                    markerEnd="url(#zero-or-one-rose)"
                    className="transition-all duration-200"
                  />

                  {/* 3. Silver msisdn ➔ Gold msisdn (Many-to-1 aggregation curve) */}
                  <path 
                    d="M 630 285 C 685 285, 685 195, 740 195" 
                    fill="none" 
                    stroke={hoveredRelation === "silver-gold" ? "#10b981" : "#10b981/45"} 
                    strokeWidth={hoveredRelation === "silver-gold" ? "3" : "1.8"} 
                    markerStart="url(#zero-or-many-amber)"
                    markerEnd="url(#one-and-only)"
                    className="transition-all duration-200"
                  />

                  {/* 4. Silver imei ➔ Gold network_fraud_ring_size (Logical component link) */}
                  <path 
                    d="M 630 345 C 685 345, 685 435, 740 435" 
                    fill="none" 
                    stroke={hoveredRelation === "silver-gold-imei" ? "#a855f7" : "#a855f7/45"} 
                    strokeWidth={hoveredRelation === "silver-gold-imei" ? "3" : "1.8"} 
                    strokeDasharray="4,4"
                    markerStart="url(#zero-or-many-purple)"
                    markerEnd="url(#zero-or-many-purple)"
                    className="transition-all duration-200"
                  />
                </svg>

                {/* INVISIBLE HOVERABLE INTERACTION PATHS (pointer-events-auto) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  {/* Bronze-Silver Interaction Line */}
                  <path 
                    d="M 270 95 C 320 95, 320 225, 380 225" 
                    fill="none" 
                    stroke="transparent" 
                    strokeWidth="12" 
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredRelation("bronze-silver")}
                    onMouseLeave={() => setHoveredRelation(null)}
                  />

                  {/* Bronze-Quarantine Interaction Line */}
                  <path 
                    d="M 270 95 C 330 130, 330 365, 270 395" 
                    fill="none" 
                    stroke="transparent" 
                    strokeWidth="12" 
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredRelation("bronze-quarantine")}
                    onMouseLeave={() => setHoveredRelation(null)}
                  />

                  {/* Silver-Gold Interaction Line */}
                  <path 
                    d="M 630 285 C 685 285, 685 195, 740 195" 
                    fill="none" 
                    stroke="transparent" 
                    strokeWidth="12" 
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredRelation("silver-gold")}
                    onMouseLeave={() => setHoveredRelation(null)}
                  />

                  {/* Silver-Gold IMEI Interaction Line */}
                  <path 
                    d="M 630 345 C 685 345, 685 435, 740 435" 
                    fill="none" 
                    stroke="transparent" 
                    strokeWidth="12" 
                    className="cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredRelation("silver-gold-imei")}
                    onMouseLeave={() => setHoveredRelation(null)}
                  />
                </svg>

                {/* TABLE CARD ENTITIES (Absolute Positions) */}
                
                {/* 1. Bronze Table */}
                <div 
                  className={`absolute z-30 w-[250px] bg-slate-950 rounded-lg border overflow-hidden shadow-xl transition-all duration-200 ${
                    hoveredRelation === "bronze-silver" || hoveredRelation === "bronze-quarantine" ? "border-blue-500 ring-2 ring-blue-500/10 shadow-blue-500/5" : "border-slate-800"
                  }`}
                  style={{ left: "20px", top: "20px" }}
                >
                  <div className="bg-blue-950/20 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-blue-400 font-mono text-[10.5px] font-bold">
                      <Database className="w-3.5 h-3.5" />
                      <span>enstream.bronze</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded font-bold uppercase tracking-wider">Raw</span>
                  </div>
                  <div className="p-1.5 divide-y divide-slate-900/60 font-mono text-[10px]">
                    {erdTables.bronze.columns.map((col) => {
                      const isHighlighted = shouldHighlightRow("enstream.bronze", col.name);
                      return (
                        <div 
                          key={col.name}
                          className={`p-1.5 flex items-center justify-between transition-all rounded ${
                            isHighlighted ? "bg-blue-500/15 text-blue-300 font-bold" : "text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          <span className="flex items-center">
                            {col.key && (
                              <span className="text-[8px] font-extrabold px-1 py-0.2 rounded mr-1 bg-blue-500/20 text-blue-400 border border-blue-500/40">{col.key}</span>
                            )}
                            <span className={isHighlighted ? "text-blue-300 font-bold" : "text-slate-200"}>{col.name}</span>
                          </span>
                          <span className="text-slate-550 text-[9px] font-mono">[{col.type.split(" ")[0]}]</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quarantine Table */}
                <div 
                  className={`absolute z-30 w-[250px] bg-slate-950 rounded-lg border overflow-hidden shadow-xl transition-all duration-200 ${
                    hoveredRelation === "bronze-quarantine" ? "border-rose-500 ring-2 ring-rose-500/10 shadow-rose-500/5" : "border-slate-800"
                  }`}
                  style={{ left: "20px", top: "320px" }}
                >
                  <div className="bg-rose-955/20 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-rose-455 font-mono text-[10.5px] font-bold">
                      <Info className="w-3.5 h-3.5" />
                      <span>enstream.quarantine</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded font-bold uppercase tracking-wider font-sans">Errors</span>
                  </div>
                  <div className="p-1.5 divide-y divide-slate-900/60 font-mono text-[10px]">
                    {erdTables.quarantine.columns.map((col) => {
                      const isHighlighted = shouldHighlightRow("enstream.quarantine", col.name);
                      return (
                        <div 
                          key={col.name}
                          className={`p-1.5 flex items-center justify-between transition-all rounded ${
                            isHighlighted ? "bg-rose-500/15 text-rose-350 font-bold" : "text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          <span className="flex items-center">
                            {col.key && (
                              <span className="text-[8px] font-extrabold px-1 py-0.2 rounded mr-1 bg-purple-500/20 text-purple-400 border border-purple-500/40">{col.key}</span>
                            )}
                            <span className={isHighlighted ? "text-rose-350 font-bold" : "text-slate-200"}>{col.name}</span>
                          </span>
                          <span className="text-slate-550 text-[9px] font-mono">[{col.type.split(" ")[0]}]</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Silver Table */}
                <div 
                  className={`absolute z-30 w-[250px] bg-slate-950 rounded-lg border overflow-hidden shadow-xl transition-all duration-200 ${
                    hoveredRelation === "bronze-silver" || hoveredRelation === "silver-gold" || hoveredRelation === "silver-gold-imei" ? "border-emerald-500 ring-2 ring-emerald-500/10 shadow-emerald-500/5" : "border-slate-800"
                  }`}
                  style={{ left: "380px", top: "115px" }}
                >
                  <div className="bg-emerald-955/20 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[10.5px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>enstream.silver</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded font-bold uppercase tracking-wider font-sans">Clean</span>
                  </div>
                  <div className="p-1.5 divide-y divide-slate-900/60 font-mono text-[10px]">
                    {erdTables.silver.columns.map((col) => {
                      const isHighlighted = shouldHighlightRow("enstream.silver", col.name);
                      return (
                        <div 
                          key={col.name}
                          className={`p-1.5 flex items-center justify-between transition-all rounded ${
                            isHighlighted ? "bg-emerald-500/15 text-emerald-300 font-bold" : "text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          <span className="flex items-center">
                            {col.key && (
                              <span className="text-[8px] font-extrabold px-1 py-0.2 rounded mr-1 bg-purple-500/20 text-purple-400 border border-purple-500/40">{col.key}</span>
                            )}
                            <span className={isHighlighted ? "text-emerald-300 font-bold" : "text-slate-200"}>{col.name}</span>
                          </span>
                          <span className="text-slate-550 text-[9px] font-mono">[{col.type.split(" ")[0]}]</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Gold Table */}
                <div 
                  className={`absolute z-30 w-[250px] bg-slate-955 rounded-lg border overflow-hidden shadow-xl transition-all duration-200 ${
                    hoveredRelation === "silver-gold" || hoveredRelation === "silver-gold-imei" ? "border-amber-500 ring-2 ring-amber-500/10 shadow-amber-500/5" : "border-slate-800"
                  }`}
                  style={{ left: "740px", top: "85px" }}
                >
                  <div className="bg-amber-955/20 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-mono text-[10.5px] font-bold">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>enstream_gold</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded font-bold uppercase tracking-wider font-sans">OLAP</span>
                  </div>
                  <div className="p-1.5 divide-y divide-slate-900/60 font-mono text-[10px]">
                    {erdTables.gold.columns.map((col) => {
                      const isHighlighted = shouldHighlightRow("enstream_gold", col.name);
                      return (
                        <div 
                          key={col.name}
                          className={`p-1.5 flex items-center justify-between transition-all rounded ${
                            isHighlighted ? "bg-amber-500/15 text-amber-300 font-bold" : "text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          <span className="flex items-center">
                            {col.key && (
                              <span className="text-[8px] font-extrabold px-1 py-0.2 rounded mr-1 bg-blue-500/20 text-blue-400 border border-blue-500/40">{col.key}</span>
                            )}
                            <span className={isHighlighted ? "text-amber-300 font-bold" : "text-slate-200"}>{col.name}</span>
                          </span>
                          <span className="text-slate-550 text-[9px] font-mono">[{col.type.split(" ")[0]}]</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-800 my-8"></div>

            {/* Detailed Field Columns List Tables (Keep the Table constraint) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                  Detailed Entity Schema Tables
                </h5>
                <span className="text-[9.5px] text-slate-500 font-mono">Column definitions & parameters</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Bronze & Quarantine Detail lists */}
                <div className="space-y-6">
                  {/* Bronze Column Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="bg-blue-950/10 border-b border-slate-850 p-3 flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-slate-200">enstream.bronze Columns Spec</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-500 font-bold text-[10px]">
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Key</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-mono text-[10px] text-slate-400">
                        {erdTables.bronze.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-900/25">
                            <td className="py-2.5 px-3 text-slate-250 font-bold">{col.name}</td>
                            <td className="py-2.5 px-3 text-slate-550">{col.type}</td>
                            <td className="py-2.5 px-3">{col.key ? <span className="px-1 bg-blue-500/10 text-blue-400 rounded text-[9px]">{col.key}</span> : "-"}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Quarantine Column Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="bg-rose-955/10 border-b border-slate-855 p-3 flex items-center space-x-2">
                      <Info className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-slate-200">enstream.quarantine Columns Spec</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-500 font-bold text-[10px]">
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Key</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-mono text-[10px] text-slate-400">
                        {erdTables.quarantine.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-900/25">
                            <td className="py-2.5 px-3 text-slate-250 font-bold">{col.name}</td>
                            <td className="py-2.5 px-3 text-slate-550">{col.type}</td>
                            <td className="py-2.5 px-3">{col.key ? <span className="px-1 bg-purple-500/10 text-purple-400 rounded text-[9px]">{col.key}</span> : "-"}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Silver & Gold Detail lists */}
                <div className="space-y-6">
                  {/* Silver Column Table */}
                  <div className="bg-slate-955 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="bg-emerald-955/10 border-b border-slate-850 p-3 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">enstream.silver Columns Spec</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-500 font-bold text-[10px]">
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Key</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-mono text-[10px] text-slate-400">
                        {erdTables.silver.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-900/25">
                            <td className="py-2.5 px-3 text-slate-250 font-bold">{col.name}</td>
                            <td className="py-2.5 px-3 text-slate-550">{col.type}</td>
                            <td className="py-2.5 px-3">{col.key ? <span className="px-1 bg-purple-500/10 text-purple-400 rounded text-[9px]">{col.key}</span> : "-"}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Gold Column Table */}
                  <div className="bg-slate-955 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="bg-amber-955/10 border-b border-slate-850 p-3 flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">enstream_gold Columns Spec</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-500 font-bold text-[10px]">
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Key</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-mono text-[10px] text-slate-400">
                        {erdTables.gold.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-900/25">
                            <td className="py-2.5 px-3 text-slate-250 font-bold">{col.name}</td>
                            <td className="py-2.5 px-3 text-slate-550">{col.type}</td>
                            <td className="py-2.5 px-3">{col.key ? <span className="px-1 bg-blue-500/10 text-blue-400 rounded text-[9px]">{col.key}</span> : "-"}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* DATA DICTIONARY VIEW */}
      {activeSubTab === "dictionary" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          
          {/* Filters and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2 bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search fields, tables, description..."
                value={dictionarySearch}
                onChange={(e) => setDictionarySearch(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-205 w-full placeholder-slate-550"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex bg-slate-955 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto space-x-1">
              <button
                onClick={() => setDictionaryFilter("all")}
                className={`px-3 py-1 rounded transition-all font-bold ${
                  dictionaryFilter === "all" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDictionaryFilter("bronze")}
                className={`px-3 py-1 rounded transition-all font-bold ${
                  dictionaryFilter === "bronze" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Bronze
              </button>
              <button
                onClick={() => setDictionaryFilter("silver")}
                className={`px-3 py-1 rounded transition-all font-bold ${
                  dictionaryFilter === "silver" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Silver
              </button>
              <button
                onClick={() => setDictionaryFilter("quarantine")}
                className={`px-3 py-1 rounded transition-all font-bold ${
                  dictionaryFilter === "quarantine" ? "bg-rose-500/10 text-rose-455 border border-rose-500/20" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Quarantine
              </button>
              <button
                onClick={() => setDictionaryFilter("gold")}
                className={`px-3 py-1 rounded transition-all font-bold ${
                  dictionaryFilter === "gold" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Gold
              </button>
            </div>
          </div>

          {/* Unified Dictionary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-3">Medallion Layer</th>
                  <th className="py-3 px-3">Table Path</th>
                  <th className="py-3 px-3">Field Name</th>
                  <th className="py-3 px-3">Data Type</th>
                  <th className="py-3 px-3">Key Constraint</th>
                  <th className="py-3 px-3">Derivation / ETL Rule</th>
                  <th className="py-3 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px] text-slate-300">
                {filteredDictionary.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-505 font-sans">
                      No matching dictionary fields found.
                    </td>
                  </tr>
                ) : (
                  filteredDictionary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/20">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          row.layer === "Bronze" ? "bg-blue-500/10 text-blue-400 border border-blue-500/10" : 
                          row.layer === "Silver" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : 
                          row.layer === "Quarantine" ? "bg-rose-500/10 text-rose-455 border border-rose-500/10" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                        }`}>
                          {row.layer}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-450">{row.table}</td>
                      <td className="py-3 px-3 text-slate-100 font-bold">{row.field}</td>
                      <td className="py-3 px-3 text-slate-500">{row.type}</td>
                      <td className="py-3 px-3">
                        {row.key ? (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            row.key === "Primary Key" || row.key === "Logical PK" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {row.key}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-405 font-sans text-[10px]">{row.rule}</td>
                      <td className="py-3 px-3 text-slate-405 font-sans text-[10px] max-w-[250px] leading-relaxed">{row.desc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PIPELINES VIEW */}
      {activeSubTab === "pipelines" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Navigation Steps */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Execution Playbook Steps</span>
              <span className="text-slate-405 text-[9px]">3 Stages</span>
            </div>
            
            <div className="space-y-3">
              {pipelineSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPipelineStep(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col space-y-2 ${
                    selectedPipelineStep === idx
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold shadow-md shadow-blue-500/5"
                      : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-extrabold ${
                      selectedPipelineStep === idx ? "bg-blue-500 text-slate-950" : "bg-slate-900 text-slate-505 border border-slate-800"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="block font-bold truncate">{step.title}</span>
                  </div>
                  
                  <div className="text-[9.5px] text-slate-500 font-sans">
                    <span className="font-bold text-slate-400">Trigger:</span> {step.trigger}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Pipeline Step Content Viewer */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
            
            {/* Step Header */}
            <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Stage {selectedPipelineStep + 1}: {pipelineSteps[selectedPipelineStep].title}
                </h4>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                  <span className="text-blue-500 font-bold uppercase font-mono mr-1">Action:</span>
                  {pipelineSteps[selectedPipelineStep].action}
                </p>
              </div>
            </div>

            {/* ETL Rules list */}
            <div className="space-y-3">
              <h5 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Transition & Processing Rules:</h5>
              <ul className="space-y-2 text-xs">
                {pipelineSteps[selectedPipelineStep].rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Block */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-550 font-mono uppercase tracking-widest">
                <span>Transformation Code Adapter</span>
                <span>Python / SQL Snippet</span>
              </div>
              <div className="bg-slate-955 rounded-xl border border-slate-855 p-4 font-mono text-[10.5px] text-slate-300 overflow-x-auto leading-relaxed max-h-[300px]">
                <pre><code>{pipelineSteps[selectedPipelineStep].code}</code></pre>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ENRICHMENT VIEW */}
      {activeSubTab === "enrichment" && (
        <div className="space-y-6">
          
          {/* Main visual comparison grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                Missing Data Resolution & Enrichment Engine
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Telecom feeds frequently contain nulls, empty fields, or mismatched properties. The EnStream pipeline standardizes, joins, and aggregates these records to produce fully enriched feature profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Left Column: Raw Payload Ingress */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 border-b border-slate-900 pb-1.5 flex justify-between">
                    <span>1. Ingress raw payload</span>
                    <span className="text-rose-455 font-bold">Contains Missing Data</span>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 font-mono text-[10px] text-slate-455 space-y-2.5">
                    <div>
                      <span className="text-slate-500 block">msisdn:</span>
                      <span className="text-slate-300 font-bold font-sans">"+1-416-555-9001 " (Trailing spaces)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">carrier:</span>
                      <span className="text-rose-400 italic">null (Missing carrier designation)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">customer_name:</span>
                      <span className="text-rose-400 italic">null (Missing user CRM details)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">device_details:</span>
                      <span className="text-rose-400 italic">null (Hardware identification missing)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ingested_source:</span>
                      <span className="text-blue-450">"bell"</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-4">
                  * Raw events committed directly to Bronze Parquet logs for compliance audits.
                </div>
              </div>

              {/* Center Column: Enrichment & Lookup Stage */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between relative">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 border-b border-slate-900 pb-1.5 flex justify-between">
                    <span>2. Enrichment Engines</span>
                    <span className="text-blue-400 font-bold">API & CDC joins</span>
                  </div>
                  <div className="space-y-3">
                    
                    {/* Carrier resolution */}
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-xs">
                      <div className="font-bold text-blue-400 font-mono text-[10.5px]">A. Ingest-Channel Resolution</div>
                      <p className="text-slate-450 text-[10px] mt-0.5">
                        Resolves carrier name to <span className="text-slate-200 font-bold">"bell"</span> by tracing incoming payload headers (source network gateway).
                      </p>
                    </div>

                    {/* CDC join */}
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-xs">
                      <div className="font-bold text-purple-400 font-mono text-[10.5px]">B. CRM CDC DB Sync</div>
                      <p className="text-slate-450 text-[10px] mt-0.5">
                        Queries the MySQL CDC binlog cache to resolve subscriber name to <span className="text-slate-200 font-bold">"Sarah Connor"</span>.
                      </p>
                    </div>

                    {/* Graph analysis */}
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 text-xs">
                      <div className="font-bold text-amber-500 font-mono text-[10.5px]">C. Bipartite BFS Graph Scan</div>
                      <p className="text-slate-450 text-[10px] mt-0.5">
                        Scans historical device connections. Enriches component fraud ring size metrics.
                      </p>
                    </div>

                  </div>
                </div>
                <div className="text-[10px] text-slate-550 flex items-center space-x-1 mt-4">
                  <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse hidden lg:block absolute -right-3 top-1/2" />
                  <span>Enrichments execute in micro-batches in features.py.</span>
                </div>
              </div>

              {/* Right Column: Enriched Gold Record */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 border-b border-slate-900 pb-1.5 flex justify-between">
                    <span>3. Enriched Gold record</span>
                    <span className="text-amber-400 font-bold">Ready for Scoring</span>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3 font-mono text-[10px] text-amber-400 space-y-2.5 border border-amber-955/20">
                    <div>
                      <span className="text-slate-500 block">msisdn:</span>
                      <span className="text-slate-100 font-bold">"14165559001" (Normalized E.164)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">carrier:</span>
                      <span className="text-slate-100 font-bold uppercase">"bell" (Enriched)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">customer_name:</span>
                      <span className="text-slate-100 font-bold">"Sarah Connor" (Enriched)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">network_fraud_ring_size:</span>
                      <span className="text-slate-100 font-bold">4 (Derived via Graph component)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">last_update_time:</span>
                      <span className="text-slate-100 font-bold">1781518291 (Committed)</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-4">
                  * Features written to Amazon Redshift for live fraud query evaluation.
                </div>
              </div>

            </div>
          </div>

          {/* Logic rules table for missing data enrichment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 className="text-[11px] font-bold text-slate-350 uppercase tracking-widest font-mono">
                Enrichment & Missing Data Resolution Dictionary
              </h5>
              <span className="text-[9.5px] text-slate-500 font-mono">Standard ETL cleaning rules</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Ingress State / Missing Case</th>
                    <th className="py-2.5 px-3">Resolution & Enrichment Strategy</th>
                    <th className="py-2.5 px-3">Enriched Product</th>
                    <th className="py-2.5 px-3">ETL Logic File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11px] text-slate-300">
                  <tr className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-bold text-slate-200">carrier</td>
                    <td className="py-3 px-3 text-rose-455 font-sans">null or empty</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">Pulls source header channel (e.g. `source="telus"` ➔ `carrier="telus"`) or checks E.164 prefix allocations.</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Standard Carrier Name</td>
                    <td className="py-3 px-3 text-slate-500">app/medallion.py</td>
                  </tr>
                  <tr className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-bold text-slate-200">customer_name</td>
                    <td className="py-3 px-3 text-rose-455 font-sans">null or missing</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">Joins with MySQL CDC synchronization cache. If no record matches, falls back to `Customer_XXXX` audit tag.</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Customer Full Name</td>
                    <td className="py-3 px-3 text-slate-500">app/features.py</td>
                  </tr>
                  <tr className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-bold text-slate-200">imei</td>
                    <td className="py-3 px-3 text-rose-455 font-sans">null or short length</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">Verifies schema completeness. Events missing hardware codes are routed to Quarantine dead-letters to isolate dirty data.</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Quarantined / Excluded</td>
                    <td className="py-3 px-3 text-slate-500">app/quality.py</td>
                  </tr>
                  <tr className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-bold text-slate-200">network_fraud_ring_size</td>
                    <td className="py-3 px-3 text-rose-455 font-sans">Not in transaction event</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">Enriched by executing a bipartite graph BFS component scan connecting phone numbers sharing device IMEIs.</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Topological Ring Size</td>
                    <td className="py-3 px-3 text-slate-500">app/features.py</td>
                  </tr>
                  <tr className="hover:bg-slate-950/20">
                    <td className="py-3 px-3 font-bold text-slate-200">fraud_exchange_matches</td>
                    <td className="py-3 px-3 text-rose-455 font-sans">Not in transaction event</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">Enriched by performing lookup joins against SFTP blacklist logs.</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">Blacklist Match Count</td>
                    <td className="py-3 px-3 text-slate-500">app/features.py</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* STORAGE & CATALOG VIEW */}
      {activeSubTab === "storage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: S3 directory mapping tree */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-blue-400" />
                S3 Warehouse & Apache Iceberg File Topology
              </h4>
              <p className="text-[10px] text-slate-550 mt-1">Parquet storage directory structures and manifest layouts</p>
            </div>

            {/* Folder structures layout */}
            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xs text-slate-300 space-y-4">
              
              <div>
                <span className="text-blue-400 font-bold">s3://enstream-warehouse/enstream/</span>
                <span className="text-slate-500 block text-[10px]"># Main lakehouse bucket path</span>
              </div>

              {/* Bronze tree */}
              <div className="pl-4 border-l border-slate-850 space-y-1">
                <div>
                  <span className="text-slate-400 font-bold">bronze/</span>
                  <span className="text-slate-550 block text-[9.5px]"># Raw landing dataset folder</span>
                </div>
                <div className="pl-4 border-l border-slate-850 space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-350">metadata/</span>
                    <div className="pl-4 text-slate-500 text-[10px] space-y-0.5">
                      <div>v1.metadata.json <span className="text-[9px] text-blue-500/80"># Iceberg catalog layout</span></div>
                      <div>version-hint.text <span className="text-[9px] text-blue-500/80"># Active version metadata pointer</span></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-355">data/</span>
                    <div className="pl-4 text-slate-500 text-[10px]">
                      <div>ingested_at=1781518/ <span className="text-[9.5px] text-slate-550 font-sans">(Hourly partitions)</span></div>
                      <div className="pl-4 text-[9px] text-blue-400">8df23a01.parquet <span className="text-slate-600"># Raw event lists</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Silver tree */}
              <div className="pl-4 border-l border-slate-855 space-y-1">
                <div>
                  <span className="text-emerald-400 font-bold">silver/</span>
                  <span className="text-slate-550 block text-[9.5px]"># Cleaned & Validated schema data</span>
                </div>
                <div className="pl-4 border-l border-slate-855 space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-355">metadata/</span>
                    <div className="pl-4 text-slate-500 text-[10px] space-y-0.5">
                      <div>v1.metadata.json <span className="text-[9px] text-emerald-500/80"># Cleansed schema manifests</span></div>
                      <div>version-hint.text <span className="text-[9px] text-emerald-500/80"># Snapshot references</span></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-355">data/</span>
                    <div className="pl-4 text-slate-500 text-[10px]">
                      <div>dt=20610/ <span className="text-[9.5px] text-slate-550 font-sans">(Daily partitions)</span></div>
                      <div className="pl-4 text-[9px] text-emerald-400">f25ccda1.parquet <span className="text-slate-600"># Cleansed event logs</span></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Redshift Storage Specs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Settings className="w-4 h-4 mr-2 text-amber-505" />
                Amazon Redshift DDL & Distribution Configurations
              </h4>
              <p className="text-[10px] text-slate-550 mt-1">OLAP aggregate table layout optimizing queries</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-[10.5px]">
                <div className="text-amber-550 font-bold uppercase tracking-wider text-[9.5px] mb-1">
                  Redshift DDL schema definition
                </div>
                <pre className="text-slate-300 leading-relaxed max-h-[200px] overflow-y-auto pr-1"><code>{`CREATE TABLE dw.enstream_gold (
    msisdn VARCHAR(24) PRIMARY KEY,
    customer_name VARCHAR(128),
    carrier VARCHAR(32),
    msisdn_age_days INT,
    port_frequency_30d INT,
    activation_recency_hours REAL,
    device_churn_count INT,
    fraud_exchange_matches INT,
    network_fraud_ring_size INT,
    last_update_time DOUBLE PRECISION
)
DISTSTYLE KEY
DISTKEY (msisdn)
SORTKEY (last_update_time);`}</code></pre>
              </div>

              {/* Dist/Sort Keys Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-955 p-3 rounded-lg border border-slate-850 space-y-1.5">
                  <div className="font-bold text-slate-200 text-[11px] uppercase tracking-widest font-mono">DISTKEY (msisdn)</div>
                  <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
                    Distributes table records across nodes hashing by subscriber number. This optimizes analytical joins with other device/fraud tables on telephone numbers and speeds scoring query execution.
                  </p>
                </div>

                <div className="bg-slate-955 p-3 rounded-lg border border-slate-850 space-y-1.5">
                  <div className="font-bold text-slate-200 text-[11px] uppercase tracking-widest font-mono">SORTKEY (last_update_time)</div>
                  <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
                    Orders records chronologically on disk. Speeds query execution for dashboard date ranges, telemetry refreshes, and delta feature recomputations.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
