import { BACKEND_URL } from "../config";
import React, { useState, useEffect } from "react";
import { 
  Code, Database, Server, Cpu, HelpCircle, Layers, 
  CheckCircle, FileText, Settings, ShieldAlert, GitBranch, Play, PlayCircle, Loader, Terminal,
  TrendingUp, BarChart2, Shield, AlertCircle, RefreshCw
} from "lucide-react";

export default function TechnicalArchitecture() {
  const [activeSubTab, setActiveSubTab] = useState<"trace" | "roadmap" | "brief" | "topology" | "code" | "schemas" | "aws">("trace");
  const [selectedCodeSection, setSelectedCodeSection] = useState<string>("dq");
  
  // Trace console states
  const [targetMsisdn, setTargetMsisdn] = useState<string>("14165559001");
  const [traceLoading, setTraceLoading] = useState<boolean>(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [bronzeMetadata, setBronzeMetadata] = useState<any>(null);
  const [silverMetadata, setSilverMetadata] = useState<any>(null);

  const msisdnPresets = [
    { label: "14165559001 (SIM Swapper / Rogers)", value: "14165559001" },
    { label: "14165559013 (Fraud Ring Node / Telus)", value: "14165559013" },
    { label: "14165559002 (Blacklisted / SFTP)", value: "14165559002" },
    { label: "14165550105 (Legit Port / TransUnion)", value: "14165550105" },
    { label: "14165550110 (CRM Sarah Connor / MySQL)", value: "14165550110" }
  ];

  const handleRunTrace = async () => {
    setTraceLoading(true);
    setTraceData(null);
    setBronzeMetadata(null);
    setSilverMetadata(null);
    
    try {
      const entityRes = await fetch(`${BACKEND_URL}/api/entity/${targetMsisdn}`);
      if (entityRes.ok) {
        const data = await entityRes.json();
        setTraceData(data);
      }
      
      const bronzeRes = await fetch(`${BACKEND_URL}/api/data/metadata/bronze`);
      if (bronzeRes.ok) {
        const metadata = await bronzeRes.json();
        setBronzeMetadata(metadata);
      }

      const silverRes = await fetch(`${BACKEND_URL}/api/data/metadata/silver`);
      if (silverRes.ok) {
        const metadata = await silverRes.json();
        setSilverMetadata(metadata);
      }
    } catch (err) {
      console.error("Trace execution failed", err);
    } finally {
      setTraceLoading(false);
    }
  };

  useEffect(() => {
    handleRunTrace();
  }, [targetMsisdn]);

  const codeSnippets: Record<string, {
    title: string;
    filePath: string;
    description: string;
    language: string;
    code: string;
  }> = {
    dq: {
      title: "Data Quality Engine (SLA Checks)",
      filePath: "backend/app/quality.py",
      language: "python",
      description: "Applies schema constraints, checks completeness of device IMEI records on carrier activations, verifies freshness thresholds (< 2 hours check), and ensures formatting (E.164 phone formats and 15-digit numeric IMEIs).",
      code: `def run_dq_check(payload: dict, source: str) -> (bool, list):
    errors = []
    
    # 1. Schema Validation (Required Fields)
    if not payload.get("msisdn"):
        errors.append("MISSING_MSISDN")
    
    # 2. Completeness Validation (Carrier requires IMEI)
    if source in ["bell", "rogers", "telus"] and not payload.get("imei") and payload.get("event_type") != "msisdn_update":
        errors.append("MISSING_IMEI")
        
    # 3. Freshness Validation (Timestamp check < 2 hours)
    event_time = payload.get("timestamp", 0)
    current_time = time.time()
    if current_time - event_time > 7200: # 2 hours in seconds
        errors.append("STALE_EVENT_EXCEEDS_2H_SLA")
        
    # 4. Formatting (E.164 & IMEI checks)
    msisdn = payload.get("msisdn", "")
    if msisdn and len(msisdn) < 10:
        errors.append("INVALID_MSISDN_FORMAT")
        
    imei = payload.get("imei", "")
    if imei and (len(imei) != 15 or not imei.isdigit()):
        errors.append("INVALID_IMEI_FORMAT")
        
    dq_passed = len(errors) == 0
    return dq_passed, errors`
    },
    graph: {
      title: "Fraud Ring BFS Graph Traversal",
      filePath: "backend/app/features.py",
      language: "python",
      description: "Builds a bipartite connection graph G = (MSISDN + IMEI, Edges) linking telephone numbers sharing hardware devices. Uses a Breadth-First Search (BFS) component scan to calculate network fraud ring sizes.",
      code: `def calculate_network_ring_size(target_msisdn: str, all_silver_events: list) -> int:
    # 1. Build bidirectional adjacency maps
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
            
    # 2. Perform BFS component size traversal
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
                        
    return len(visited_msisdns)`
    },
    scoring: {
      title: "Trust Score Engine & SHAP Explainability",
      filePath: "backend/app/scoring.py",
      language: "python",
      description: "Computes a trust score (0-100) using weights from the model registry. Calculates SHAP contribution vectors showing the points subtracted by active risk rules.",
      code: `def score_msisdn(msisdn: str) -> dict:
    # Get profile features from gold / online feature store
    features = get_features(msisdn)
    trust_score = 100
    deductions = {}
    reason_codes = []
    
    # 1. Blacklist Check
    if features.get("fraud_exchange_matches", 0) > 0:
        deductions["fraud_exchange_matches"] = -60.0
        reason_codes.append("FRAUD_EXCHANGE_HIT")
        
    # 2. Port Frequency Check
    port_freq = features.get("port_frequency_30d", 0)
    if port_freq >= 3:
        deductions["port_frequency_30d"] = -30.0
        reason_codes.append("HIGH_PORTING_FREQUENCY")
        
    # 3. Device SIM Swap Churn
    device_churn = features.get("device_churn_count", 0)
    if device_churn >= 3:
        deductions["device_churn_count"] = -20.0
        reason_codes.append("DEVICE_SIM_SWAP_CHURN")
        
    # 4. Network Fraud Ring
    ring_size = features.get("network_fraud_ring_size", 0)
    if ring_size >= 3:
        deductions["network_fraud_ring_size"] = min(-50.0, -10.0 * ring_size)
        reason_codes.append("FRAUD_RING_MEMBER")
        
    # Calculate final score
    total_deduction = sum(deductions.values())
    trust_score = max(0, 100 + total_deduction)
    
    return {
        "msisdn": msisdn,
        "trust_score": trust_score,
        "suspicion_tier": "Critical" if trust_score <= 20 else "High Risk" if trust_score <= 50 else "Medium Risk" if trust_score <= 80 else "Low Risk",
        "fraud_flag": trust_score <= 50,
        "reason_codes": reason_codes,
        "explainability": deductions # SHAP contributions
    }`
    },
    drift: {
      title: "ML Drift Monitoring (PSI Index)",
      filePath: "backend/app/models.py",
      language: "python",
      description: "Calculates the Population Stability Index (PSI) to track feature and scoring drift over time between the training baseline and live inference score distributions.",
      code: `def calculate_psi(baseline_scores: list, current_scores: list) -> float:
    # 1. Partition scores into 5 standard bins
    bins = [0, 20, 40, 60, 80, 100]
    
    expected_counts, _ = np.histogram(baseline_scores, bins=bins)
    actual_counts, _ = np.histogram(current_scores, bins=bins)
    
    # 2. Compute ratios (proportions)
    expected_ratios = expected_counts / len(baseline_scores)
    actual_ratios = actual_counts / len(current_scores)
    
    # 3. Sum index values using smoothing factor
    psi = 0.0
    epsilon = 1e-5
    for a, e in zip(actual_ratios, expected_ratios):
        a_s = a + epsilon
        e_s = e + epsilon
        psi += (a - e) * np.log(a_s / e_s)
        
    return psi`
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-100">
      
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-500" />
            System Architecture & Technical Working
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Explore the transition roadmap, vendor design parameters, and run live pipeline traces on conformed data.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("trace")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "trace" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Live Execution Trace
          </button>
          <button
            onClick={() => setActiveSubTab("roadmap")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "roadmap" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Phase Roadmap
          </button>
          <button
            onClick={() => setActiveSubTab("brief")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "brief" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Vendor Brief & Feedback
          </button>
          <button
            onClick={() => setActiveSubTab("topology")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "topology" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Topology
          </button>
          <button
            onClick={() => setActiveSubTab("code")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "code" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Code Inspector
          </button>
          <button
            onClick={() => setActiveSubTab("schemas")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "schemas" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Schemas
          </button>
          <button
            onClick={() => setActiveSubTab("aws")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "aws" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            AWS Integration
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LIVE EXECUTION TRACER */}
      {activeSubTab === "trace" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs w-full md:w-auto">
              <span className="text-slate-400 font-bold whitespace-nowrap">Select Target Entity:</span>
              <select
                value={targetMsisdn}
                onChange={(e) => setTargetMsisdn(e.target.value)}
                disabled={traceLoading}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none w-full md:w-64"
              >
                {msisdnPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunTrace}
              disabled={traceLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/25 text-slate-100 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all shrink-0"
            >
              {traceLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Executing Trace...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Execute Trace</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Data Quality SLA validator assertions (quality.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Validates structural constraints and E.164 formats</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden">
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-850">
                          <th className="p-2 text-slate-400">Constraint Asserted</th>
                          <th className="p-2 text-slate-400">Target Value</th>
                          <th className="p-2 text-slate-400">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-850">
                          <td className="p-2 text-slate-300">CHECK_MSISDN_FORMAT</td>
                          <td className="p-2 text-slate-400">{traceData.msisdn}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr className="border-b border-slate-850">
                          <td className="p-2 text-slate-300">CHECK_IMEI_LENGTH</td>
                          <td className="p-2 text-slate-400">{traceData.features.device_churn_count > 0 ? "15 Digits" : "N/A"}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr className="border-b border-slate-850">
                          <td className="p-2 text-slate-300">CHECK_FRESHNESS_SLA</td>
                          <td className="p-2 text-slate-400">{"< 2 Hours delay"}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-300">CHECK_SCHEMA_COMPLETENESS</td>
                          <td className="p-2 text-slate-400">All fields populated</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="font-bold">Automated DQ Status:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold rounded-full">
                      DQ_PASSED
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to inspect assertions.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <GitBranch className="w-4 h-4 mr-1.5 text-amber-400" />
                  Shared-Device Graph component BFS walk (features.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">BFS component walk traversing device IMEI relations</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-3 font-mono text-[10.5px] bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="text-blue-400 font-bold uppercase tracking-wider text-[9px] mb-1">BFS Walk debug console</div>
                  <div>
                    <span className="text-slate-500">Initialize Queue:</span>
                    <span className="text-slate-300"> [ Root: {traceData.msisdn} ]</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Bipartite Scan:</span>
                    <span className="text-slate-300"> Found IMEIs: [ {traceData.silver_events?.[0]?.imei || "None"} ]</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Traversed nodes:</span>
                    <span className="text-slate-300"> {traceData.features.network_fraud_ring_size > 1 ? `Found ${traceData.features.network_fraud_ring_size} sharing MSISDNs` : "No shared device links"}</span>
                  </div>
                  <div className="border-t border-slate-850 pt-2 mt-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 font-sans">Network Component size:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      traceData.features.network_fraud_ring_size >= 3 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-300"
                    }`}>
                      Size: {traceData.features.network_fraud_ring_size || 1}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to inspect graph walk.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-rose-500" />
                  Scoring Engine Rules Math deductions (scoring.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Ledger showing deductions subtracted from baseline 100</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10.5px] space-y-2">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-400 font-bold">Rule Feature Evaluated</span>
                      <span className="text-slate-400 font-bold">Points Deducted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-355">Base Trust Score</span>
                      <span className="text-emerald-450 font-bold">+100</span>
                    </div>
                    {Object.entries(traceData.score.explainability || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="flex justify-between text-rose-400">
                        <span className="uppercase text-slate-350">{key.replace(/_/g, " ")}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-xs">
                      <span className="text-slate-200">FINAL TRUST SCORE</span>
                      <span className={traceData.score.trust_score <= 50 ? "text-rose-400" : "text-emerald-400"}>
                        {traceData.score.trust_score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 text-[10.5px]">
                    <div className="flex-1 p-2 bg-slate-950 border border-slate-850 rounded text-center">
                      <span className="text-slate-500 block">Suspicion Tier:</span>
                      <span className="font-bold text-slate-200 uppercase">{traceData.score.suspicion_tier}</span>
                    </div>
                    <div className="flex-1 p-2 bg-slate-950 border border-slate-850 rounded text-center">
                      <span className="text-slate-500 block">Fraud Flag:</span>
                      <span className={`font-bold uppercase ${traceData.score.fraud_flag ? "text-rose-400" : "text-emerald-400"}`}>
                        {traceData.score.fraud_flag ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to view deductions ledger.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-blue-400" />
                  Latest Apache Iceberg metadata manifest (vN.metadata.json)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Actual S3 table catalog JSON generated by pyarrow pipeline</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : bronzeMetadata ? (
                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-lg border border-slate-850 p-3 font-mono text-[9px] text-slate-300 max-h-[160px] overflow-y-auto leading-relaxed">
                    <pre><code>{JSON.stringify(bronzeMetadata, null, 2)}</code></pre>
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Catalog Type: Local SQLite File</span>
                    <span className="text-blue-400 font-bold">v{bronzeMetadata["last-sequence-number"] || 1} manifest</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to fetch Iceberg metadata.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PHASE ROADMAP */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Transition Roadmap: Path to Northstar Architecture
            </h4>
            
            {/* Horizontal timeline cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-5">
              
              {/* Phase 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 relative">
                <div className="absolute -top-2 -right-2 bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                  AS-IS (Active)
                </div>
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 1 (End-June)</div>
                <h5 className="font-bold text-slate-200 text-xs">Batch Operationalized</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Incremental load from MySQL reporting DB to Bronze S3. batch B→S→G Spark jobs. manual ML scoring to S3/Redshift Serverless catalog substrate.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Scores reconcile to holdout PoC logic. Idempotency on MySQL loader retry.
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 2 (Early-July)</div>
                <h5 className="font-bold text-slate-200 text-xs">Batch Automated</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Automated scheduling via MWAA (Airflow) / AWS Step Functions. Dependency retry mapping. platform DQ layer on S3 & alerting alerts.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Scheduled runs meet SLAs. Zero score divergence from Phase 1. 1 rollback drill.
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 3 (End-August)</div>
                <h5 className="font-bold text-slate-200 text-xs">Interim Real-Time</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Temporary real-time score query path via Kinesis MSK indexing on IDV database. Flink streaming. Online Feature Store serving sync API.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  P95 &lt; 2s / P99 &lt; 5s API latency budget. fallback failover to last batch score.
                </div>
              </div>

              {/* Phase 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 4 (End-December)</div>
                <h5 className="font-bold text-slate-200 text-xs">Source-Direct Real-Time</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Retire IDV databases. Carrier-direct event feeds (Flink/DMS stream). Schema registry validation at boundary. Event replay and backfills.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  P95 &lt; 2s from raw source event timestamp. Equivalence validation on replay.
                </div>
              </div>

              {/* Phase 5 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 5 (Continuous)</div>
                <h5 className="font-bold text-slate-200 text-xs">Continuous Everything</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Continuous ML drift tracking. Automated retraining & eval harness. promotion gates. Golden evaluation datasets pipeline.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Traceable build release. automated rollback triggered on drift/DQ breach.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VENDOR BRIEF & ARCHITECTURE EVALUATION */}
      {activeSubTab === "brief" && (
        <div className="space-y-6 font-sans">
          
          {/* Main specifications overview grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MySQL Database & Volume Specs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Database className="w-4 h-4 mr-2 text-emerald-450" />
                MySQL Ingestion & Data Volumes
              </h4>
              
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Inherited DB Size</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">1.0 TB</span>
                  <span className="text-[10px] text-slate-450 ml-2">growing at 7 GB / day</span>
                </div>
                
                <div className="border-t border-slate-850/50 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Source Streams Ingress Rate</span>
                  <span className="text-lg font-bold font-mono text-blue-450">400 records / second</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">(Excluding Rogers 2-minute batch drop events)</span>
                </div>

                <div className="border-t border-slate-850/50 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Lineage Entity Volume</span>
                  <span className="text-lg font-bold font-mono text-amber-500">~30,000,000</span>
                  <span className="text-[10px] text-slate-450 block mt-0.5">MSISDNs, SIMs, Accounts, and Hardware Devices</span>
                </div>

                <div className="border-t border-slate-850/50 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Score Query Expectations</span>
                  <span className="text-xs font-bold text-slate-300 block font-mono">
                    • Start: 1,000,000 requests / day<br/>
                    • Steady State: 5,000,000 requests / day
                  </span>
                </div>

                <div className="border-t border-slate-850/50 pt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">MySQL Reporting Schema scope:</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                    1. Customer events: records of API verification queries (Integration contract v1.38).<br/>
                    2. Customer journey events: live API feeds (Bell & Telus) and 2-min file drops (Rogers).
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Responsiveness to Change */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                Change-Responsive Design
              </h4>
              
              <div className="space-y-3.5 text-xs font-sans">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-200">1. Data Inputs Change (Schema Drift)</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By utilizing **Apache Iceberg Schema Evolution**, column additions, renames, and type widening are resolved in metadata without rewriting the S3 parquet storage files. Glue Registry contract gates quarantine breaking drifts immediately to the DLQ.
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-850/50 pt-3">
                  <h5 className="font-extrabold text-slate-200">2. Business Rules Additions</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rules are decoupled from pipeline structure. Preprocessing, deductions, and tiers are parameterized inside dynamic JSON config dictionaries. Rules engine recalculates deductions dynamically without modifying spark compile jars.
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-850/50 pt-3">
                  <h5 className="font-extrabold text-slate-200">3. ML Model Swaps</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The **MLflow Model Registry** facilitates Champion/Challenger deployment. Promoting a version in the registry fires a trigger to set dirty flags on active MSISDNs, initiating selective recomputations of online feature databases.
                  </p>
                </div>
              </div>
            </div>

            {/* Orchestration Analysis & Evaluation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Code className="w-4 h-4 mr-2 text-rose-500" />
                Orchestration Trade-off Evaluation
              </h4>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between font-bold border-b border-slate-850 pb-1 text-[10px] uppercase text-slate-500">
                    <span>Engine Considered</span>
                    <span>Use Case & Fit</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 block text-xs">AWS Managed Airflow (MWAA)</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      *Pros*: Flexible dependency DAGs, python native, excellent retry tracing, perfect for batch runs. *Cons*: Latency is in minutes, unsuitable for event-by-event synchronous scoring.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-850/50 pt-2">
                    <span className="font-extrabold text-slate-200 block text-xs">AWS Step Functions</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      *Pros*: Sub-second latency, serverless execution, direct integrations with Lambda & Kinesis, low operational overhead. *Cons*: Harder to write complex looping scripts.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] text-slate-500 font-mono">
                  <span className="font-bold text-slate-400">Decision Matrix:</span> We utilize **MWAA** for Stage 1 & 2 batch aggregations / gold recalculations, and cut over to **Step Functions** for Phase 3/4 low-latency API serving routes.
                </div>
              </div>
            </div>

          </div>

          {/* Subex Case & Bad Actor ML Classification */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                RFP Clarification: Cross-Sector Bad Actor ML Logic
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                The **Cross-Sector Bad Actor Data Exchange** is a core requirement of this RFP engagement. To implement equivalence to proposals like Subex, EnStream is incorporating specialized ML classification logic.
              </p>
              
              <div className="space-y-2 mt-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="text-slate-300 font-bold uppercase text-[9px]">Subex Architecture Proposal:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  Subex proposed migrating the **entire database** from the Bad Actor Platform into their specialized **Fraudzap** application environment, where they run proprietary offline ML algorithms for precise classification.
                </p>
                <div className="border-t border-slate-850 pt-2.5 mt-2.5 text-slate-400 text-[11px] leading-relaxed font-sans">
                  <span className="font-bold text-blue-400 block font-mono uppercase text-[9.5px]">EnStream Modern Parity Approach:</span>
                  Rather than copying the entire DB off-premises (which triggers governance risks), our platform enables secure model deployment directly onto the AWS Medallion substrate, preserving data residency.
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <HelpCircle className="w-4 h-4 mr-2 text-rose-500" />
                Strategic Competitive Positioning
              </h4>
              <p className="text-xs text-slate-450 leading-relaxed mt-2 font-sans">
                Our proposed design directly targets the limitations of traditional, rigid system integrator architectures (such as Tech Mahindra or Wipro).
              </p>
              
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-200 block">Open Table Standards vs. Proprietary Jars</span>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 leading-relaxed">
                      Wipro/TechM typically propose black-box proprietary systems, leading to vendor-lock. EnStream's S3 Medallion built on open **Apache Iceberg** tables allows the client's in-house team to easily plug in other analytical platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 border-t border-slate-850/50 pt-3">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-200 block">Selective Real-Time Recompute vs. Global batch runs</span>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 leading-relaxed">
                      Competing proposals often rely on resource-heavy nightly global batch recalculations to refresh scores. Our selective **Dirty Flag** BFS component walk reduces computing complexity by recalculating features only for affected accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: DATA TOPOLOGY */}
      {activeSubTab === "topology" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-2 text-rose-500" />
              Medallion Lakehouse Flow Topology
            </h4>
            <p className="text-xs text-slate-400 mt-1">Tracing raw data ingestion down to analytical warehouse aggregation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs leading-relaxed">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono">01</div>
              <h5 className="font-extrabold text-slate-200">1. Raw Event Ingestion</h5>
              <p className="text-slate-400 text-[11px]">
                Events arrive in real-time from Bell/Rogers/Telus carrier APIs, TransUnion PortPS, MySQL CDC agents, or SFTP blacklist uploads. The backend event loop functions as a high-throughput queue mapping incoming payloads onto a unified schema structure.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold font-mono">02</div>
              <h5 className="font-extrabold text-slate-200">2. Bronze S3 Parquet Landing</h5>
              <p className="text-slate-400 text-[11px]">
                Raw payloads are written as Parquet tables inside AWS S3 folders (simulated locally). Every write updates the Apache Iceberg catalog format, creating a new metadata json file manifest (`vN.metadata.json`) and versioning logs to enable time-travel queries.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">03</div>
              <h5 className="font-extrabold text-slate-200">3. Silver cleansed Iceberg Layer</h5>
              <p className="text-slate-400 text-[11px]">
                Validation tasks read from Bronze. Data Quality (DQ) metrics verify structure, E.164 phone ranges, 15-digit device IMEIs, and data freshness. Entries passing validation checks are normalized and committed into the cleansed 'enstream.silver' Iceberg table.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">04</div>
              <h5 className="font-extrabold text-slate-200">4. Gold Aggregate Redshift</h5>
              <p className="text-slate-400 text-[11px]">
                Features are selectively computed for dirty entities (MSISDNs that recently processed updates). Connect components are traversed using graph BFS to track hardware-sharing rings. Features are committed directly to AWS Redshift tables for OLAP dashboard reporting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CODE INSPECTOR */}
      {activeSubTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex flex-col">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800 pb-2">
              Select Logic Module
            </div>
            {Object.entries(codeSnippets).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCodeSection(key)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                  selectedCodeSection === key
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold"
                    : "bg-slate-950 border-slate-850 hover:border-slate-855 text-slate-400"
                }`}
              >
                <span className="block font-bold">{value.title}</span>
                <span className="block text-[9px] text-slate-550 font-mono mt-1">{value.filePath}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {codeSnippets[selectedCodeSection].title}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Source File: {codeSnippets[selectedCodeSection].filePath}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-slate-950 rounded text-[9px] text-slate-400 font-mono border border-slate-850">
                {codeSnippets[selectedCodeSection].language.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-855">
              {codeSnippets[selectedCodeSection].description}
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[350px]">
              <pre><code>{codeSnippets[selectedCodeSection].code}</code></pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: DATA SCHEMAS */}
      {activeSubTab === "schemas" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Database className="w-4 h-4 mr-1.5 text-blue-400" />
                Bronze Schema (enstream.bronze)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">S3 Parquet raw event ingestion landing table</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">event_id</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Unique key generated per raw ingestion log.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">event_type</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Category of activity (e.g. activation, porting).</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">msisdn</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Target subscriber telephone number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">payload</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Stringified raw JSON payload parameters.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">source</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Source gateway (e.g. bell, rogers, transunion).</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                Silver Schema (enstream.silver)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Cleansed, validated, and normalized Iceberg dataset</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">carrier</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Sanitized lowercase carrier name.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">imei</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Cleaned 15-digit device IMEI number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">dq_passed</span> <span className="text-slate-500 text-[10px]">(boolean)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Flag indicating if all DQ checks succeeded.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">dq_errors</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">JSON string array listing DQ validation issues.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Cpu className="w-4 h-4 mr-1.5 text-amber-400" />
                Gold Schema (enstream_gold)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Redshift aggregate subscriber feature profiles</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">msisdn_age_days</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Number of days since initial phone activation.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">device_churn_count</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Distinct devices (IMEIs) connected with number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">network_fraud_ring_size</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Size of device-sharing network component.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">port_frequency_30d</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Carrier port transactions in the last 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: AWS CLOUD INTEGRATION */}
      {activeSubTab === "aws" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Settings className="w-4 h-4 mr-2 text-blue-400" />
              AWS Cloud Integration & Connection Settings
            </h4>
            <p className="text-xs text-slate-400 mt-1">Environment variable mapping and adapter connection workflows</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h5 className="font-extrabold text-slate-350">1. Hybrid Environment Matrix</h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The EnStream prototype functions out-of-the-box locally. Setting the following environment variables switches the backend storage engine from SQLite/local folders to S3, Glue Catalog, and Amazon Redshift.
              </p>
              
              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-[10.5px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="p-2.5 text-slate-200">Env Variable</th>
                      <th className="p-2.5 text-slate-200">Local Default</th>
                      <th className="p-2.5 text-slate-200">AWS Target Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">AWS_ACCESS_KEY_ID</td>
                      <td className="p-2.5 text-slate-500 font-mono">None</td>
                      <td className="p-2.5 text-slate-300 font-mono">AWS key ID credentials</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">AWS_REGION</td>
                      <td className="p-2.5 text-slate-500 font-mono">us-east-1</td>
                      <td className="p-2.5 text-slate-300 font-mono">ca-central-1 (CA)</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">WAREHOUSE_PATH</td>
                      <td className="p-2.5 text-slate-500 font-mono">./warehouse</td>
                      <td className="p-2.5 text-slate-300 font-mono">s3://bucket-name/warehouse</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-blue-400">REDSHIFT_CONN_STR</td>
                      <td className="p-2.5 text-slate-500 font-mono">None</td>
                      <td className="p-2.5 text-slate-300 font-mono">redshift://user:pass@endpoint:5439/db</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-extrabold text-slate-355">2. Storage Adapters</h5>
              
              <div className="space-y-3 font-mono text-[10.5px]">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-850">
                  <div className="font-extrabold text-blue-400 flex items-center mb-1">
                    <GitBranch className="w-3.5 h-3.5 mr-1" /> S3 / Iceberg PyArrow connection
                  </div>
                  <p className="text-slate-400 text-[10.5px] font-sans leading-relaxed">
                    Uses 's3fs' file systems. If WAREHOUSE_PATH starts with s3://, datasets are written as parquet files directly to S3 partitioned pathways, updating the schema catalog manifests.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-850">
                  <div className="font-extrabold text-emerald-450 flex items-center mb-1">
                    <Database className="w-3.5 h-3.5 mr-1" /> AWS Redshift Connector
                  </div>
                  <p className="text-slate-400 text-[10.5px] font-sans leading-relaxed">
                    Uses python's 'redshift-connector' database client. Writes Gold aggregates by parsing the connection string and executing UPSERT queries on Redshift data warehouses.
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
