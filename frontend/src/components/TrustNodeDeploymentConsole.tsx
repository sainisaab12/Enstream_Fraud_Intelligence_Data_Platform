import React, { useState, useEffect } from "react";
import { 
  Package, Settings, Terminal, Activity, Database, Cpu, Layers, 
  Shield, Share2, Play, CheckCircle, AlertCircle, Server, Network, 
  ArrowRight, Lock, Unlock, RefreshCw, FileText, Check, Plus, 
  ChevronRight, Info, Sliders, ChevronDown, CheckSquare, Square
} from "lucide-react";

export default function TrustNodeDeploymentConsole() {
  const [activeStep, setActiveStep] = useState<number>(1);
  
  // --- Step 2 Config States ---
  const [selectedSources, setSelectedSources] = useState<string[]>(["kafka", "oracle"]);
  const [featureSelection, setFeatureSelection] = useState({
    identity: true,
    device: true,
    behavioral: true,
    fraud: true
  });
  const [sharingPolicies, setSharingPolicies] = useState<{ id: string; name: string; category: string; allowed: boolean }[]>([
    { id: "subscriber_tenure", name: "subscriber_tenure", category: "Identity", allowed: true },
    { id: "sim_swap_count_90d", name: "sim_swap_count_90d", category: "Device", allowed: true },
    { id: "ownership_stability", name: "ownership_stability", category: "Behavioral", allowed: true },
    { id: "device_risk_score", name: "device_risk_score", category: "Fraud", allowed: true },
    { id: "customer_name", name: "customer_name", category: "Identity", allowed: false },
    { id: "date_of_birth", name: "date_of_birth", category: "Identity", allowed: false },
    { id: "address", name: "address", category: "Identity", allowed: false },
    { id: "raw_transactions", name: "raw_transactions", category: "Behavioral", allowed: false },
  ]);
  const [webhookUrl, setWebhookUrl] = useState<string>("https://carrier-trust-node.internal/hooks/telemetry");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("kubernetes");

  // --- Step 3 Deploy States ---
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);

  // --- Step 4 Runtime States ---
  const [simulationEvent, setSimulationEvent] = useState<string>("sim_swap");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [runtimeLogs, setRuntimeLogs] = useState<string[]>([
    "[SYSTEM] Runtime operational. Heartbeat green. Ready for data stream..."
  ]);
  const [inspectedLayer, setInspectedLayer] = useState<number>(1);
  const [processedSignals, setProcessedSignals] = useState<{name: string; value: string; allowed: boolean}[]>([]);

  // Toggle Data Source
  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  // Toggle Feature Category
  const toggleFeatureCategory = (category: keyof typeof featureSelection) => {
    setFeatureSelection({
      ...featureSelection,
      [category]: !featureSelection[category]
    });
  };

  // Toggle Policy Sharing
  const toggleSharingPolicy = (id: string) => {
    setSharingPolicies(sharingPolicies.map(policy => {
      if (policy.id === id) {
        return { ...policy, allowed: !policy.allowed };
      }
      return policy;
    }));
  };

  // Generate dynamic YAML based on config states
  const generateConfigYaml = () => {
    const sourcesYaml = selectedSources.map(s => `  - type: ${s}\n    enabled: true\n    credentials_secret_ref: trust-node-${s}-creds`).join("\n");
    const featuresYaml = Object.entries(featureSelection)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => `  - library: ${name}\n    resolution: real-time`)
      .join("\n");
    
    const allowedPolicies = sharingPolicies.filter(p => p.allowed).map(p => `    - signal: ${p.name}\n      encryption: JWE-A256GCM`).join("\n");
    const blockedPolicies = sharingPolicies.filter(p => !p.allowed).map(p => `    - field: ${p.name}\n      action: DROP_AND_MASK`).join("\n");

    return `apiVersion: trustnode.enstream.com/v1alpha1
kind: TrustNodeConfiguration
metadata:
  name: participant-carrier-node
  namespace: trust-node
spec:
  deploymentTarget: ${selectedPlatform}
  ingressConnectors:
${sourcesYaml || "  # No sources configured"}
  featureEngine:
    stateStore: RocksDB
    engineMode: LowLatencyCDC
    activeLibraries:
${featuresYaml || "    # No libraries selected"}
  privacyEngine:
    piiProtection: SHA256Salted
    consentRequired: true
    sharingRules:
      allow:
${allowedPolicies || "      # No signals allowed"}
      never_share:
${blockedPolicies || "      # No fields configured"}
  egressGateway:
    centralEndpoint: https://api.enstream.com/v2/intelligence
    webhooks:
      - url: ${webhookUrl}
        events: [score.drift, security.alert]`;
  };

  // Run Deployment Simulation
  const handleStartDeploy = () => {
    setIsDeploying(true);
    setDeployProgress(5);
    setDeploySuccess(false);
    setDeployLogs(["$ helm install enstream-trust-node \\", "    --namespace trust-node \\", "    --values participant-config.yaml", ""]);

    const logs = [
      "[HELM] Parsing Helm values and validating custom resource schemas...",
      "[INGRESS] Spawning Ingest Connectors... [Kafka: OK, Oracle: OK, REST API: Standby]",
      "[STATE] Mounting persistent volume claim for RocksDB local cache...",
      "[ENGINE] Initializing Trust Feature Engine with v2.1.0 telemetry rules...",
      "[STORE] Spawning local state management microservices (Redis cache + local state database)...",
      "[PRIVACY] Loading Privacy Rules & Consent validation schema contracts...",
      "[SHIELD] Applying local PII Masking policy: raw subscriber numbers will be hashed at ingress.",
      "[GATEWAY] Spawning Federation gRPC Gateway on port 9090...",
      "[OBSERVABILITY] Registering OpenTelemetry endpoints and local Prometheus server...",
      "[HELM] Performing post-installation health check hooks...",
      "[HELM] Handshake with EnStream Trust Intelligence Cloud: SECURE / SIGNED",
      "[SUCCESS] Trust Node successfully provisioned and verified!",
      "[SYSTEM] Node Status: ONLINE / HEALTHY"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          setDeploySuccess(true);
          return 100;
        }
        
        // Add log entries periodically
        if (prev % 8 === 0 && currentLogIndex < logs.length) {
          setDeployLogs(l => [...l, logs[currentLogIndex]]);
          currentLogIndex++;
        }
        
        return prev + 5;
      });
    }, 150);
  };

  // Run Runtime Simulation (Dynamic Traffic Flow through 7 Layers)
  const triggerTrafficSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveLayer(1);
    setRuntimeLogs([`[SIMULATOR] Triggered scenario: ${simulationEvent.toUpperCase()} event stream`]);

    const layersLogs: Record<number, string[]> = {
      1: [
        `[1. CONNECTIVITY] Event ingested via local Kafka topic '${selectedSources.includes("kafka") ? "rogers.telemetry.events" : "telemetry.events"}'.`,
        `[1. CONNECTIVITY] Raw payload read: { msisdn: "+14165550011", event: "${simulationEvent === "sim_swap" ? "SIM_SWAP_REQUEST" : "CELL_ATTACH"}" }`
      ],
      2: [
        "[2. DATA CERTIFICATION] Running validation against telemetry schema v1.38.",
        "[2. DATA CERTIFICATION] Data Quality Check: MSISDN matches E.164. Ingress latency SLA: 4ms (Threshold: <2h) [PASS].",
        "[2. DATA CERTIFICATION] Lineage node created: Ingest -> State DB."
      ],
      3: [
        `[3. TRUST FEATURE ENGINE] Retrieving rolling transaction window from local storage.`,
        simulationEvent === "sim_swap"
          ? "[3. TRUST FEATURE ENGINE] Calculated feature: sim_swap_count_90d = 3. Flagging high velocity!"
          : "[3. TRUST FEATURE ENGINE] Calculated feature: sim_swap_count_90d = 0. Standard activity.",
        "[3. TRUST FEATURE ENGINE] Feature: subscriber_tenure = 8 Years. Feature: ownership_stability = Stable."
      ],
      4: [
        "[4. FEATURE STORE] Persisting calculated state to local online state store (Redis cache).",
        "[4. FEATURE STORE] Synced aggregates to offline analytics database for drift profiling."
      ],
      5: [
        "[5. PRIVACY & GOVERNANCE] Shield checking PII rules. Masking subscriber raw phone number.",
        "[5. PRIVACY & GOVERNANCE] Hashed identifier generated: '9a8b7c6d5e...'. Blocking raw_transactions field.",
        "[5. PRIVACY & GOVERNANCE] Verification: No direct identity attributes leave this gateway."
      ],
      6: [
        "[6. FEDERATION GATEWAY] Packaging verified trust scoring inputs.",
        "[6. FEDERATION GATEWAY] Signatures verified. Encrypting with JSON Web Encryption (JWE) envelope.",
        `[6. FEDERATION GATEWAY] gRPC request sent to Central Platform. Payload: { sim_swap_count: ${simulationEvent === "sim_swap" ? 3 : 0}, tenure: '8 Years' }`
      ],
      7: [
        "[7. OBSERVABILITY] Recorded transactional stats. Egress response latency: 11ms.",
        "[7. OBSERVABILITY] Health metrics sent to Central Platform Prometheus server. Heartbeat GREEN."
      ]
    };

    let step = 1;
    const interval = setInterval(() => {
      if (step > 7) {
        clearInterval(interval);
        setIsSimulating(false);
        setActiveLayer(0);
        
        // Output signals finalized
        setProcessedSignals([
          { name: "subscriber_tenure", value: "8 Years", allowed: sharingPolicies.find(p => p.id === "subscriber_tenure")?.allowed || false },
          { name: "sim_swap_count_90d", value: simulationEvent === "sim_swap" ? "3" : "0", allowed: sharingPolicies.find(p => p.id === "sim_swap_count_90d")?.allowed || false },
          { name: "ownership_stability", value: "Stable", allowed: sharingPolicies.find(p => p.id === "ownership_stability")?.allowed || false },
          { name: "device_risk_score", value: simulationEvent === "sim_swap" ? "HIGH RISK" : "LOW RISK", allowed: sharingPolicies.find(p => p.id === "device_risk_score")?.allowed || false },
          { name: "customer_name", value: "REDACTED", allowed: sharingPolicies.find(p => p.id === "customer_name")?.allowed || false },
          { name: "date_of_birth", value: "REDACTED", allowed: sharingPolicies.find(p => p.id === "date_of_birth")?.allowed || false },
          { name: "address", value: "REDACTED", allowed: sharingPolicies.find(p => p.id === "address")?.allowed || false },
        ]);
        
        setRuntimeLogs(prev => [...prev, "[SUCCESS] Local Scoring Pipeline Execution Completed. Cryptographic envelope dispatched!"]);
        return;
      }

      setRuntimeLogs(prev => [...prev, ...layersLogs[step]]);
      setActiveLayer(step);
      setInspectedLayer(step);
      step++;
    }, 1000);
  };

  // Trigger scenario change reset
  useEffect(() => {
    setProcessedSignals([]);
  }, [simulationEvent]);

  // Set initial logs in Step 4
  useEffect(() => {
    if (activeStep === 4 && runtimeLogs.length <= 1) {
      setRuntimeLogs([
        "[SYSTEM] Local Trust Node Runtime: Active / Online",
        "[CONNECTIVITY] Listening on Kafka Brokers: rogers-kafka-0:9092, rogers-kafka-1:9092",
        "[OBSERVABILITY] Prometheus metric publisher active on port 9100",
        "[SYSTEM] Awaiting simulated carrier network telemetry events..."
      ]);
    }
  }, [activeStep]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-100">
      
      {/* Dashboard Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center">
            <Package className="w-6 h-6 mr-2.5 text-blue-500" />
            EnStream Trust Node Deployment Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Package, configure, and orchestrate private telecom trust nodes inside carriers' secure boundaries. 
            Deploy custom telemetry and data sharing policies in a zero-trust architecture.
          </p>
        </div>
        
        {/* Step Indicator Panel */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 w-full lg:w-auto overflow-x-auto select-none">
          {[
            { id: 1, label: "1. Packaged Node", icon: Package },
            { id: 2, label: "2. Low-Code Config", icon: Settings },
            { id: 3, label: "3. CLI Deployer", icon: Terminal },
            { id: 4, label: "4. Live Runtime", icon: Activity }
          ].map(s => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            const isCompleted = activeStep > s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (isCompleted || isActive || deploySuccess || s.id < activeStep) {
                    setActiveStep(s.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive 
                    ? "bg-blue-600 text-slate-100 shadow-md" 
                    : isCompleted 
                      ? "text-emerald-400 hover:bg-slate-900/50" 
                      : "text-slate-500 hover:text-slate-350 cursor-not-allowed"
                }`}
                disabled={!deploySuccess && s.id === 4 && activeStep < 3}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-100" : isCompleted ? "text-emerald-400" : "text-slate-600"}`} />
                <span>{s.label}</span>
                {isCompleted && <Check className="w-3.5 h-3.5 ml-1 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PRE-BUILT TRUST NODE PACKAGE */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Summary Info */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="bg-blue-900/40 text-blue-400 border border-blue-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Distribution Bundle
              </span>
              <h3 className="text-sm font-bold text-slate-200">EnStream Trust Node Distribution</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                The EnStream Trust Node is distributed as a single packaged bundle (Helm Chart and container cluster images). It compiles, anonymizes, and serves telecom trust scoring signals locally under absolute carrier data sovereignty.
              </p>
              
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Release:</span>
                  <span className="font-mono text-slate-300">v2.1.0-stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Packaging Type:</span>
                  <span className="font-mono text-slate-300">Helm Chart (K8s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">License Model:</span>
                  <span className="font-mono text-slate-300">Federated Carrier License</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button 
                onClick={() => setActiveStep(2)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-slate-100 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Initialize Configuration Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Components Grid */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-blue-500" />
              What's Included in the Distribution Package
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Pre-built Microservices",
                  desc: "Containerized, high-throughput engines built in Go and Java to process raw event logs and run telemetry analytics.",
                  icon: Cpu,
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
                },
                {
                  title: "Pre-configured Connectors",
                  desc: "Native data adaptors for Kafka streams, Oracle, SFTP, REST endpoints, and CDC (Change Data Capture) database hooks.",
                  icon: Database,
                  color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
                },
                {
                  title: "Standardized Feature Library",
                  desc: "Pre-compiled signal algorithms covering identity verification, sim changes, location anomaly, and device risk scoring.",
                  icon: Layers,
                  color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
                },
                {
                  title: "Data Quality & Governance Rules",
                  desc: "Built-in schema assertions, watermarking definitions, and automatic quarantine pipelines for corrupt payloads.",
                  icon: CheckCircle,
                  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                },
                {
                  title: "Privacy & Policy Framework",
                  desc: "Built-in tokenizers, cryptographic hashing engines (SHA-256), and JSON Web Encryption (JWE) message envelopes.",
                  icon: Shield,
                  color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
                },
                {
                  title: "Monitoring & Observability",
                  desc: "Pre-integrated OpenTelemetry exporters, Prometheus metric hosts, and Grafana dashboard templates for local ops.",
                  icon: Activity,
                  color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 flex flex-col justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: LOW-CODE / NO-CODE CONFIGURATION CONSOLE */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column Configuration Controls */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
            
            {/* Data Source Configuration */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">
                1. Connect Data Sources
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 select-none">
                {[
                  { id: "oracle", label: "Oracle Database", desc: "Legacy Subscriber Records", icon: Database },
                  { id: "kafka", label: "Kafka Streams", desc: "Live Network Events", icon: Network },
                  { id: "rest", label: "REST API Gateway", desc: "On-Demand Partner Checks", icon: Server },
                  { id: "sftp", label: "SFTP / File Ingest", desc: "Daily Batch Exports", icon: FileText },
                  { id: "cdc", label: "CDC Connector", desc: "Database Transaction Logs", icon: RefreshCw }
                ].map(src => {
                  const Icon = src.icon;
                  const isSelected = selectedSources.includes(src.id);
                  return (
                    <button
                      key={src.id}
                      onClick={() => toggleSource(src.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? "bg-blue-600/10 border-blue-500 text-blue-300" 
                          : "bg-slate-950 border-slate-850 text-slate-450 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-slate-600"}`} />
                        <span className="text-[10px] font-bold truncate">{src.label}</span>
                      </div>
                      <span className="text-[8px] text-slate-500 block mt-0.5 font-mono truncate">{src.desc}</span>
                    </button>
                  );
                })}
                <button className="p-2.5 rounded-lg border border-dashed border-slate-800 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-all flex flex-col items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold mt-0.5">Add Custom Ingress</span>
                </button>
              </div>
            </div>

            {/* Feature Library Selection */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">
                2. Select Features to Generate
              </span>
              <div className="grid grid-cols-2 gap-3 select-none">
                {[
                  { key: "identity", label: "Identity Features", desc: "12 features (tenure, verification history)", icon: Cpu },
                  { key: "device", label: "Device Features", desc: "8 features (sim swaps, hardware change)", icon: Network },
                  { key: "behavioral", label: "Behavioral Features", desc: "10 features (call/data velocity, location hop)", icon: Sliders },
                  { key: "fraud", label: "Fraud Features", desc: "9 features (chargeback tags, network risk flags)", icon: Shield }
                ].map(feat => {
                  const Icon = feat.icon;
                  const isChecked = featureSelection[feat.key as keyof typeof featureSelection];
                  return (
                    <button
                      key={feat.key}
                      onClick={() => toggleFeatureCategory(feat.key as any)}
                      className={`p-3 rounded-lg border text-left flex justify-between items-start transition-all ${
                        isChecked 
                          ? "bg-slate-950 border-blue-500/60 text-slate-200" 
                          : "bg-slate-950/40 border-slate-850 text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isChecked ? "text-blue-500" : "text-slate-650"}`} />
                          <span className="text-[10.5px] font-bold">{feat.label}</span>
                        </div>
                        <span className="text-[8.5px] text-slate-500 block font-mono">{feat.desc}</span>
                      </div>
                      <div>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-700" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy & Sharing Policies */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">
                  3. Configure Privacy &amp; Sharing Policies
                </span>
                <span className="text-[9px] text-amber-500 font-mono flex items-center bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                  <Shield className="w-3 h-3 mr-1" />
                  PII Strict Isolation
                </span>
              </div>
              
              <div className="bg-slate-950 rounded-lg border border-slate-850 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allowed / Trust Signals */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wide">
                      Allowed for Sharing (Anonymized Signals Only)
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {sharingPolicies.filter(p => p.allowed).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-1.5 bg-slate-900 rounded border border-slate-800 text-[10px]">
                          <span className="font-mono text-slate-300">{p.name}</span>
                          <button 
                            onClick={() => toggleSharingPolicy(p.id)}
                            className="text-rose-400 hover:text-rose-350 text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                          >
                            Block
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blocked / Raw PII */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-rose-400 font-bold block uppercase tracking-wide">
                      Blocked / Never Shared (Raw PII / Transactions)
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {sharingPolicies.filter(p => !p.allowed).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-1.5 bg-slate-900/60 rounded border border-slate-850 text-[10px]">
                          <span className="font-mono text-slate-500 strike-through">{p.name}</span>
                          <button 
                            onClick={() => toggleSharingPolicy(p.id)}
                            className="text-emerald-450 hover:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-emerald-500/10"
                          >
                            Allow
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications & Deployment Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">
                  4. Configure Webhooks
                </span>
                <input 
                  type="text" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">
                  5. Deployment Platform Target
                </span>
                <div className="grid grid-cols-3 gap-1 select-none">
                  {[
                    { id: "kubernetes", label: "K8s/OpenShift" },
                    { id: "docker", label: "Compose" },
                    { id: "baremetal", label: "Bare Metal" }
                  ].map(plat => (
                    <button
                      key={plat.id}
                      onClick={() => setSelectedPlatform(plat.id)}
                      className={`py-2 px-1 text-[9px] font-bold uppercase rounded-lg border transition-all truncate ${
                        selectedPlatform === plat.id 
                          ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Config Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button 
                onClick={() => setActiveStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Back to step 1
              </button>
              <button 
                onClick={() => setActiveStep(3)}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-slate-100 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5"
              >
                <span>Verify &amp; Advance to Deployment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column Configuration YAML Preview */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Generated Configuration Bundle</span>
                  <span className="text-[9px] font-mono text-slate-500">participant-config.yaml</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  The yaml block updates dynamically as you toggle ingress channels, select feature libraries, and set sharing permissions.
                </p>
              </div>

              <pre className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[9px] font-mono text-blue-300 overflow-x-auto h-[380px] leading-relaxed mt-3 select-text">
                {generateConfigYaml()}
              </pre>

              <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-[10px] text-slate-400 font-sans mt-3 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  This policy bundle is cryptographically verified by the central registry and loaded dynamically at boot time of the Trust Node runtime.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: ONE-CLICK DEPLOYMENT */}
      {activeStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column deployment controls */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
            <div className="space-y-2">
              <span className="bg-purple-900/40 text-purple-400 border border-purple-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Automated Deployment Orchestrator
              </span>
              <h3 className="text-sm font-bold text-slate-200">Execute Participant Node Provisioning</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Choose the installation parameters, and deploy the EnStream Trust Node cluster directly onto the carrier's hosting infrastructure (VPC, Private cloud subnet, or edge hypervisor).
              </p>
            </div>

            {/* Selection Options */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">1. Selected Deployment Target</span>
                <span className="text-xs font-bold text-slate-200 capitalize mt-1 block flex items-center">
                  <Server className="w-4 h-4 text-blue-500 mr-2" />
                  {selectedPlatform} Environment
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-800 p-2.5 rounded-lg bg-slate-900/60">
                  <span className="text-slate-500 text-[9px] block uppercase font-bold">Est. Deployment Time</span>
                  <span className="font-bold text-slate-300 mt-1 block">30 - 60 Minutes</span>
                </div>
                <div className="border border-slate-800 p-2.5 rounded-lg bg-slate-900/60">
                  <span className="text-slate-500 text-[9px] block uppercase font-bold">Integration Overhead</span>
                  <span className="font-bold text-slate-300 mt-1 block">Minimal (Low-Code Policy)</span>
                </div>
              </div>
            </div>

            {/* Deployment Action Button */}
            <div className="pt-2">
              <button
                onClick={handleStartDeploy}
                disabled={isDeploying}
                className={`w-full py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                  isDeploying 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750" 
                    : deploySuccess 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-slate-100" 
                      : "bg-blue-600 hover:bg-blue-700 text-slate-100 shadow-md"
                }`}
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Deploying Node Cluster ({deployProgress}%)...</span>
                  </>
                ) : deploySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-slate-100" />
                    <span>Redeploy / Update Trust Node</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-slate-100 fill-current" />
                    <span>Deploy EnStream Trust Node</span>
                  </>
                )}
              </button>
            </div>

            {/* Auto-provisioned checklist */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-850/60">
              <h4 className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                Auto-Provisioned Infrastructure
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                {[
                  { name: "Input Ingress Connectors", ok: deploySuccess },
                  { name: "RocksDB Local Store", ok: deploySuccess },
                  { name: "PII Masking & Privacy Shield", ok: deploySuccess },
                  { name: "Federation Gateway Proxy", ok: deploySuccess },
                  { name: "Observability Metrics Stack", ok: deploySuccess },
                  { name: "Central Handshake Certs", ok: deploySuccess }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? "bg-emerald-500" : "bg-slate-750"}`}></div>
                    <span className={item.ok ? "text-slate-300" : "text-slate-500"}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next step prompt */}
            {deploySuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs animate-pulse">
                <span className="text-emerald-450 font-bold">Node online. Live scoring pipeline ready!</span>
                <button
                  onClick={() => setActiveStep(4)}
                  className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded font-bold hover:bg-emerald-400 transition-all flex items-center space-x-1"
                >
                  <span>Launch Live Runtime Monitor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Right Column deployment terminal logs */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-300 ml-2 font-mono">helm-installer-shell</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">release: enstream-trust-node</span>
              </div>

              {/* Terminal Log Screen */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg font-mono text-[10px] text-slate-400 h-[380px] overflow-y-auto space-y-1.5 select-text relative">
                {deployLogs.length === 0 ? (
                  <span className="text-slate-600 italic">Terminal idle. Click 'Deploy EnStream Trust Node' to initiate execution.</span>
                ) : (
                  deployLogs.map((log, idx) => {
                    let color = "text-slate-400";
                    if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-bold";
                    else if (log.includes("[HELM]")) color = "text-blue-400";
                    else if (log.includes("[SYSTEM]")) color = "text-cyan-400 font-bold";
                    else if (log.startsWith("$")) color = "text-slate-200 font-bold";
                    
                    return (
                      <div key={idx} className={color}>
                        {log}
                      </div>
                    );
                  })
                )}
                
                {isDeploying && (
                  <div className="flex items-center space-x-1.5 text-blue-500 mt-2 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Installing chart release dependencies...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>Docker Registry: hub.enstream.internal</span>
                <span>Version: v2.1.0</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 4: RUNTIME LIVE OPERATIONS MONITOR */}
      {activeStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Main Diagram Area (7 Layers) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
            
            {/* Top Interactive Event Simulator Controller */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">1. Select Simulated Event Scenario</span>
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    value={simulationEvent}
                    onChange={(e) => setSimulationEvent(e.target.value)}
                    disabled={isSimulating}
                    className="bg-slate-900 border border-slate-800 rounded text-xs p-1.5 text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="sim_swap">SIM Swap Request (High Risk Scenario)</option>
                    <option value="normal_attach">Standard Cell Attach (Normal Scenario)</option>
                    <option value="location_hop">Location Velocity Hop (Medium Risk Scenario)</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={triggerTrafficSimulation}
                disabled={isSimulating}
                className={`py-2 px-5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSimulating 
                    ? "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800" 
                    : "bg-blue-600 hover:bg-blue-700 text-slate-100 shadow-md"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run scoring pipeline simulation</span>
              </button>
            </div>

            {/* Visual 7 Layers Interactive Diagram */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  2. Trust Node Runtime Layers (Participant VPC Environment)
                </span>
                <span className="text-[9px] text-slate-450 font-mono">
                  Click layers to inspect metrics &amp; state
                </span>
              </div>
              
              <div className="space-y-2 select-none">
                {[
                  { id: 1, name: "1. Connectivity Layer", desc: "Oracle, Kafka Streams, CDC connectors. Pulls raw event payload.", color: "border-blue-500/20 text-blue-400 bg-blue-500/5", glow: "border-blue-500 bg-blue-500/10 shadow-blue-500/10" },
                  { id: 2, name: "2. Data Certification Layer", desc: "Runs schema validation, data quality checks, and registers lineage details.", color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5", glow: "border-cyan-500 bg-cyan-500/10 shadow-cyan-500/10" },
                  { id: 3, name: "3. Trust Feature Engine", desc: "Calculates real-time aggregation metrics (sim swaps, location velocity).", color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5", glow: "border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10" },
                  { id: 4, name: "4. Feature Store (RocksDB / Redis)", desc: "Stores online state in Redis cache and offline history in Iceberg tables.", color: "border-purple-500/20 text-purple-400 bg-purple-500/5", glow: "border-purple-500 bg-purple-500/10 shadow-purple-500/10" },
                  { id: 5, name: "5. Privacy & Governance Layer", desc: "PII masking, identity hashing (SHA-256), and data sharing contract verification.", color: "border-rose-500/20 text-rose-455 bg-rose-500/5", glow: "border-rose-500 bg-rose-500/10 shadow-rose-500/10" },
                  { id: 6, name: "6. Federation Gateway Proxy", desc: "Signatures validation. Encrypts score payload in a secure JWE envelope.", color: "border-emerald-500/20 text-emerald-450 bg-emerald-500/5", glow: "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10" },
                  { id: 7, name: "7. Observability Layer", desc: "Prometheus exporter. Tracks CPU, memory, and transactional scoring latency.", color: "border-amber-500/20 text-amber-400 bg-amber-500/5", glow: "border-amber-500 bg-amber-500/10 shadow-amber-500/10" },
                ].map(layer => {
                  const isActive = activeLayer === layer.id;
                  const isInspected = inspectedLayer === layer.id;
                  
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setInspectedLayer(layer.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                        isActive 
                          ? `${layer.glow} scale-[1.01] border-2` 
                          : isInspected 
                            ? "bg-slate-950 border-blue-500/40 text-slate-200" 
                            : `${layer.color} hover:bg-slate-950/40`
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                          )}
                          <span className="text-xs font-bold">{layer.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans block">{layer.desc}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        {isInspected && (
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
                            Inspecting
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 text-slate-650 transition-transform ${isInspected ? "rotate-90 text-slate-400" : ""}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom approved signals leaving panel */}
            <div className="space-y-3 border-t border-slate-800 pt-5">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider block">
                3. Final Egress Output (Only Approved Trust Signals Leave Participant)
              </span>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-wrap gap-2 items-center">
                {processedSignals.length === 0 ? (
                  <span className="text-[10.5px] text-slate-500 italic">No execution trace currently active. Run the simulation to trace outputs.</span>
                ) : (
                  processedSignals.map((sig, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono flex items-center space-x-2 ${
                        sig.allowed 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                          : "bg-rose-950/10 border-rose-500/20 text-rose-500 line-through opacity-50"
                      }`}
                    >
                      <span className="font-bold">{sig.name}:</span>
                      <span>{sig.value}</span>
                      {sig.allowed ? (
                        <Unlock className="w-3 h-3 text-emerald-400 ml-1.5" />
                      ) : (
                        <Lock className="w-3 h-3 text-rose-500 ml-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Layer Inspector & Console Logs) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* Live Layer Inspector Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">Layer Inspector</span>
                <span className="text-[9px] font-mono text-slate-500">Layer {inspectedLayer} of 7</span>
              </div>
              
              {/* Dynamic content depending on inspectedLayer */}
              {(() => {
                const layerStats: Record<number, any> = {
                  1: {
                    title: "Connectivity Layer",
                    metrics: [
                      { label: "Active Connectors", val: `${selectedSources.length} Connected` },
                      { label: "Ingress Queue Load", val: "2,450 events/sec" },
                      { label: "Latency", val: "1.2ms" }
                    ],
                    details: "Listens directly to raw participant systems. Kafka Consumer threads are currently healthy. Auto-reconnect enabled for SFTP."
                  },
                  2: {
                    title: "Data Certification Layer",
                    metrics: [
                      { label: "Schema Compliance", val: "100% Compliant" },
                      { label: "Quarantine Ratio", val: "0.02% (2 Bad Events)" },
                      { label: "Check Execution", val: "0.4ms" }
                    ],
                    details: "Applies schema telemetry check assertions. Verifies E.164 formats, string lengths, and ensures SLA latency requirements are satisfied."
                  },
                  3: {
                    title: "Trust Feature Engine",
                    metrics: [
                      { label: "Feature Throughput", val: "14,500 features/sec" },
                      { label: "Engine State Store", val: "RocksDB Local" },
                      { label: "Calculation Overhead", val: "3.5ms" }
                    ],
                    details: "Compiles aggregations locally. Processes time-series window aggregates (SIM updates, location movements, velocity anomalies)."
                  },
                  4: {
                    title: "Feature Store",
                    metrics: [
                      { label: "Online Cache Hits", val: "99.8% (Redis)" },
                      { label: "Offline Storage", val: "Apache Iceberg" },
                      { label: "Offline Table Sync", val: "Every 5 Mins" }
                    ],
                    details: "Dual-layer storage model. Reads query requests from memory (Redis) and writes conformed transactions to Iceberg files."
                  },
                  5: {
                    title: "Privacy & Governance",
                    metrics: [
                      { label: "PII Masking", val: "Enabled (SHA-256)" },
                      { label: "Contract Policy", val: "v1.0 Strict" },
                      { label: "Consent Verification", val: "Required" }
                    ],
                    details: "Filters raw subscriber identity records. Hashing triggers instantly at node boundaries. Unallowed data fields are blocked and masked."
                  },
                  6: {
                    title: "Federation Gateway",
                    metrics: [
                      { label: "Encryption Mode", val: "JWE-A256GCM" },
                      { label: "Protobuf Contracts", val: "v2.0-protobuf" },
                      { label: "gRPC Target", val: "Central Cloud Portal" }
                    ],
                    details: "The cryptographic output boundary. Encrypts score payload in a secure JWE envelope and pushes it to the EnStream registry."
                  },
                  7: {
                    title: "Observability Layer",
                    metrics: [
                      { label: "Processor Latency", val: "11ms" },
                      { label: "Node CPU Load", val: "12%" },
                      { label: "Handshake Heartbeat", val: "GREEN / ACTIVE" }
                    ],
                    details: "Tracks performance metrics. Exposes Prometheus telemetry targets to report data quality indicators, feature drift, and latency."
                  }
                };
                
                const curLayer = layerStats[inspectedLayer] || layerStats[1];
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-sans">{curLayer.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{curLayer.details}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Key Real-Time Metrics</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {curLayer.metrics.map((m: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-950 p-2 rounded border border-slate-850">
                            <span className="text-slate-400 font-sans">{m.label}:</span>
                            <span className="font-mono text-blue-400 font-bold">{m.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Monospace Runtime console log */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2 h-[260px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">Runtime Pipeline Console Logs</span>
                <span className="text-[9px] font-mono text-slate-500">Node Release: v2.1.0</span>
              </div>

              {/* Logs Screen */}
              <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg font-mono text-[9.5px] text-slate-400 h-full overflow-y-auto space-y-1 select-text leading-relaxed">
                {runtimeLogs.map((log, idx) => {
                  let color = "text-slate-400";
                  if (log.includes("[SYSTEM]")) color = "text-slate-500";
                  else if (log.includes("[SIMULATOR]")) color = "text-amber-500 font-bold";
                  else if (log.includes("SLA") || log.includes("[PASS]") || log.includes("[SUCCESS]")) color = "text-emerald-400";
                  else if (log.includes("[1. CONNECTIVITY]")) color = "text-blue-400";
                  else if (log.includes("[2. DATA CERTIFICATION]")) color = "text-cyan-400";
                  else if (log.includes("[3. TRUST FEATURE ENGINE]")) color = "text-indigo-400";
                  else if (log.includes("[4. FEATURE STORE]")) color = "text-purple-400";
                  else if (log.includes("[5. PRIVACY & GOVERNANCE]")) color = "text-rose-455";
                  else if (log.includes("[6. FEDERATION GATEWAY]")) color = "text-emerald-450";
                  else if (log.includes("[7. OBSERVABILITY]")) color = "text-amber-400";
                  
                  return (
                    <div key={idx} className={color}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
