import React, { useState, useEffect } from "react";
import { 
  Shield, Network, Database, Cpu, Layers, Zap, Share2, BarChart2, 
  AlertTriangle, TrendingUp, Settings, Users, CheckCircle, GitMerge, 
  ChevronLeft, ChevronRight, Play, RefreshCw, Plus, X, Server, 
  FileText, ArrowRight, Table, Info, AlertCircle, Eye, EyeOff
} from "lucide-react";

export default function FederatedTrustNetwork() {
  const [activeScreen, setActiveScreen] = useState(0);

  // --- Simulation State 1: Trust Intelligence Exchange ---
  const [exchangeQueryActive, setExchangeQueryActive] = useState(false);
  const [exchangeResults, setExchangeResults] = useState<any>(null);
  const [exchangeLogs, setExchangeLogs] = useState<string[]>([]);
  const [exRogersTenure, setExRogersTenure] = useState("8 Years");
  const [exRogersSimSwap, setExRogersSimSwap] = useState(0);
  const [exRogersDeviceTrust, setExRogersDeviceTrust] = useState("High");
  const [exBellOwnership, setExBellOwnership] = useState("Stable");
  const [exBellFraudHistory, setExBellFraudHistory] = useState(0);
  const [exBureauExposure, setExBureauExposure] = useState("Low");

  // --- Simulation State 2: Real-Time Lifecycle ---
  const [lifecycleStep, setLifecycleStep] = useState(0);
  const [lifecycleRunning, setLifecycleRunning] = useState(false);
  const [lifecycleEvent, setLifecycleEvent] = useState("SIM Swap");
  
  // --- Simulation State 3: Unstructured Intelligence ---
  const [unstructuredText, setUnstructuredText] = useState(
    "Investigation Note: Subscriber profile matching MSISDN 4165551234 flagged. Customer care log indicates three consecutive SIM card queries within 2 hours from a suspicious IP block. Subscriber reports receiving a phishing SMS before device connectivity stopped. Relayed from Bell partner gateway."
  );
  const [nlpProcessing, setNlpProcessing] = useState(false);
  const [nlpResults, setNlpResults] = useState<any>(null);

  // --- Simulation State 4: ML Observability drift feature ---
  const [driftFeature, setDriftFeature] = useState("sim_swap");
  
  // --- Simulation State 5: Champion/Challenger Model ---
  const [challengerMetrics, setChallengerMetrics] = useState({
    name: "Ensemble-DeepTrust-v3.2-Beta",
    accuracy: 94.6,
    latency: 35,
    drift: 0.04
  });
  const [championMetrics, setChampionMetrics] = useState({
    name: "XGBoost-Fraud-v4.1",
    accuracy: 92.4,
    latency: 22,
    drift: 0.12
  });
  const [modelOrchestratorLogs, setModelOrchestratorLogs] = useState<string[]>([]);
  const [orchestratorWeights, setOrchestratorWeights] = useState({
    accuracy: 8,
    latency: 6,
    confidence: 7,
    freshness: 5,
    explainability: 6,
    cost: 4
  });
  const [selectedOrchestratedModel, setSelectedOrchestratedModel] = useState("XGBoost-Fraud-v4.1");

  // --- Simulation State 6: Onboarding Wizard ---
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardName, setOnboardName] = useState("");
  const [onboardIndustry, setOnboardIndustry] = useState("Telco");
  const [onboardConnectivity, setOnboardConnectivity] = useState("Kafka");
  const [onboardFeatures, setOnboardFeatures] = useState<string[]>([
    "subscriber_tenure",
    "sim_swap_count"
  ]);
  const [onboardLogs, setOnboardLogs] = useState<string[]>([]);
  const [onboardFinished, setOnboardFinished] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);

  // --- Federated Trust Node Architecture subtab states ---
  const [nodeSubTab, setNodeSubTab] = useState<"functional" | "technical" | "interaction">("functional");
  const [selectedFuncBlock, setSelectedFuncBlock] = useState<string>("ingress");
  const [activeTechCard, setActiveTechCard] = useState<"kafka" | "rocksdb" | "iceberg" | "jwe" | "grpc">("kafka");
  const [activePayloadScenario, setActivePayloadScenario] = useState<"normal" | "sim_swap" | "location">("normal");
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [interactionConsoleLogs, setInteractionConsoleLogs] = useState<string[]>([
    "[SYSTEM] Terminal initialized. Waiting for protocol execution commands..."
  ]);
  const [interactionPlane, setInteractionPlane] = useState<"data" | "control">("data");

  // Ingestion Scenarios Data
  const scenariosData = {
    normal: {
      name: "Scenario A: Normal Subscriber Activity",
      ingress: {
        description: "Standard attach event containing plaintext identifiers. Ingested locally without forwarding.",
        input: `{
  "msisdn": "+14165550011",
  "imsi": "302720999999999",
  "event_type": "CELL_ATTACH",
  "timestamp": "2026-06-23T17:13:54Z",
  "network_id": "ROGERS_ONT_04",
  "cell_tower_id": "TOR_SUBURB_12",
  "imei": "358764091234567"
}`,
        output: `{
  "msisdn": "+14165550011",
  "imsi": "302720999999999",
  "event_type": "CELL_ATTACH",
  "timestamp": "2026-06-23T17:13:54Z"
}`
      },
      engine: {
        description: "Stateful streaming processor compiles aggregates inside local RocksDB state. Flagged: 0 SIM swaps.",
        input: `{
  "msisdn": "+14165550011",
  "event_type": "CELL_ATTACH",
  "timestamp": "2026-06-23T17:13:54Z"
}`,
        output: `{
  "subscriber_key": "rogers_sub_0011",
  "sim_swap_count_2h": 0,
  "device_switch_count_24h": 0,
  "location_change_count_1h": 1,
  "network_tenure_days": 1850
}`
      },
      privacy: {
        description: "PII Shield sanitizes data. Plaintext identifiers hashed via SHA-256. Plaintext tower redacted.",
        input: `{
  "subscriber_key": "rogers_sub_0011",
  "sim_swap_count_2h": 0,
  "device_switch_count_24h": 0
}`,
        output: `{
  "hashed_msisdn": "6d3c051cf57a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b1ab",
  "sim_swap_count_2h": 0,
  "device_switch_count_24h": 0,
  "location_change_count_1h": 1,
  "data_privacy_consent": true
}`
      },
      gateway: {
        description: "Aggregates sealed inside secure JOSE JWE envelope. Decryptable only by Central Platform private key.",
        input: `{
  "hashed_msisdn": "6d3c051cf57a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b1ab",
  "sim_swap_count_2h": 0
}`,
        output: `"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhHQ00iLCJraWQiOiJub2RlLXJvZ2Vycy0wMSJ9.
d8wE_g92k7sL9aKx2kd8s2B...[Encrypted Payload]...
.c928KdBv7ad81aKsd"`
      }
    },
    sim_swap: {
      name: "Scenario B: Suspicious SIM Swap Sequence",
      ingress: {
        description: "SIM swap request telemetry. Triggers strict validation paths due to hijacking signatures.",
        input: `{
  "msisdn": "+14165558899",
  "imsi": "302720888888888",
  "event_type": "SIM_SWAP_REQUEST",
  "timestamp": "2026-06-23T17:13:54Z",
  "network_id": "ROGERS_ONT_04",
  "cell_tower_id": "TOR_DOWNTOWN_09",
  "imei": "860922041234567"
}`,
        output: `{
  "msisdn": "+14165558899",
  "imsi": "302720888888888",
  "event_type": "SIM_SWAP_REQUEST",
  "timestamp": "2026-06-23T17:13:54Z"
}`
      },
      engine: {
        description: "Stateful engine calculates SIM swap aggregates. Flagged: 3 swaps detected inside 2 hours.",
        input: `{
  "msisdn": "+14165558899",
  "event_type": "SIM_SWAP_REQUEST",
  "timestamp": "2026-06-23T17:13:54Z"
}`,
        output: `{
  "subscriber_key": "rogers_sub_8899",
  "sim_swap_count_2h": 3,
  "device_switch_count_24h": 2,
  "location_change_count_1h": 2,
  "network_tenure_days": 42
}`
      },
      privacy: {
        description: "PII details removed. Hashed MSISDN generated. Data contract validates schema integrity.",
        input: `{
  "subscriber_key": "rogers_sub_8899",
  "sim_swap_count_2h": 3,
  "device_switch_count_24h": 2
}`,
        output: `{
  "hashed_msisdn": "ae3f051cde7a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b2ff",
  "sim_swap_count_2h": 3,
  "device_switch_count_24h": 2,
  "location_change_count_1h": 2,
  "data_privacy_consent": true
}`
      },
      gateway: {
        description: "High-risk features package compiled, signed, encrypted using JWE envelope for egress.",
        input: `{
  "hashed_msisdn": "ae3f051cde7a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b2ff",
  "sim_swap_count_2h": 3
}`,
        output: `"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhHQ00iLCJraWQiOiJub2RlLXJvZ2Vycy0wMSJ9.
yP8q_x91h82Ls7ka9s1K8fJ...[Encrypted Payload]...
.a88dKdBv7ad81aKaa"`
      }
    },
    location: {
      name: "Scenario C: High-Frequency Location Hopping",
      ingress: {
        description: "Incoming cell handover event. Telemetry shows Vancouver location, previous log was Montreal 30m ago.",
        input: `{
  "msisdn": "+14165557766",
  "imsi": "302720777777777",
  "event_type": "CELL_HANDOVER",
  "timestamp": "2026-06-23T17:13:54Z",
  "network_id": "ROGERS_ONT_04",
  "cell_tower_id": "VAN_AIRPORT_01",
  "imei": "358764095555555"
}`,
        output: `{
  "msisdn": "+14165557766",
  "imsi": "302720777777777",
  "event_type": "CELL_HANDOVER",
  "timestamp": "2026-06-23T17:13:54Z"
}`
      },
      engine: {
        description: "Calculates impossible travel. Flagged: Vancouver and Montreal tower handovers within 30m indicates physical travel impossibility.",
        input: `{
  "msisdn": "+14165557766",
  "event_type": "CELL_HANDOVER",
  "timestamp": "2026-06-23T17:13:54Z"
}`,
        output: `{
  "subscriber_key": "rogers_sub_7766",
  "sim_swap_count_2h": 0,
  "device_switch_count_24h": 1,
  "location_change_count_1h": 4,
  "impossible_travel_flag": true,
  "network_tenure_days": 920
}`
      },
      privacy: {
        description: "Cleans PII telemetry. Retains impossible travel flag as a numerical feature. MSISDN is hashed.",
        input: `{
  "subscriber_key": "rogers_sub_7766",
  "impossible_travel_flag": true
}`,
        output: `{
  "hashed_msisdn": "bc8c051cf57a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b9aa",
  "sim_swap_count_2h": 0,
  "device_switch_count_24h": 1,
  "location_change_count_1h": 4,
  "impossible_travel_flag": true,
  "data_privacy_consent": true
}`
      },
      gateway: {
        description: "Signs and encrypts feature aggregates with JWE container prior to tunnel transmission.",
        input: `{
  "hashed_msisdn": "bc8c051cf57a0bc077b9497e59b922119eb506a5b6c86720bfcd4b397e50b9aa",
  "impossible_travel_flag": true
}`,
        output: `"eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhHQ00iLCJraWQiOiJub2RlLXJvZ2Vycy0wMSJ9.
h9W2_z19a82LsK92kLa18a8...[Encrypted Payload]...
.b288KdBv7ad81aKss"`
      }
    }
  };

  const addConsoleLog = (logLines: string[]) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
    const formatted = logLines.map(line => `[${timestamp}] ${line}`);
    setInteractionConsoleLogs(prev => [...prev, ...formatted]);
  };

  const triggerScoringRequest = () => {
    const activeMsisdnHash = activePayloadScenario === "normal" 
      ? "6d3c051c..." 
      : activePayloadScenario === "sim_swap" 
        ? "ae3f051c..." 
        : "bc8c051c...";
    addConsoleLog([
      `[GRPC] Inbound connection requested by Central Platform (IP: 10.120.44.8).`,
      `[TLS] Establishing mTLS 1.3 channel. Negotiated cipher: TLS_CHACHA20_POLY1305_SHA256`,
      `[TLS] Client cert verified: CN=central.exchange.enstream.ca, O=EnStream Alliance`,
      `[GRPC] Calling RPC: QueryFeatures(hashed_msisdn = "${activeMsisdnHash}", query_id = "req_q_${Math.floor(Math.random() * 90000 + 10000)}")`,
      `[ROCKSDB] Query state store. Key found in features namespace.`,
      `[SHIELD] Data Contract validator invoked. Scanned fields: 0 PII violations found.`,
      `[CRYPT] Wrapping payload into RFC 7516 JWE Envelope. Encryption algorithm: AES-GCM-128`,
      `[GRPC] Returning encrypted envelope payload. RPC status code: 200 OK`,
      `[GRPC] Connection gracefully closed. Egress network latency: 6.4ms.`
    ]);
  };

  const triggerConsentRevocation = () => {
    addConsoleLog([
      `[GRPC] Inbound connection requested by Central Platform (IP: 10.120.44.8).`,
      `[TLS] mTLS connection established with CN=central.exchange.enstream.ca`,
      `[GRPC] Calling RPC: QueryFeatures(hashed_msisdn = "ae3f051c...", query_id = "req_q_${Math.floor(Math.random() * 90000 + 10000)}")`,
      `[ROCKSDB] Query state store. Subscriber records found.`,
      `[SHIELD] Checking local consent directory (ledger storage)...`,
      `[WARNING] Consent status: DENIED by subscriber. Enforcement policy active.`,
      `[SHIELD] Data Contract Validation Error: POLICY_VIOLATION - CONSENT_REVOKED. Payload blocked.`,
      `[GRPC] Aborting RPC. Returning gRPC Status: PermissionDenied (403).`,
      `[AUDIT] Log entry appended to audit ledger: BLOCKED_QUERY_CONSENT_REVOKED for hash "ae3f051c..."`
    ]);
  };

  const triggerModelWeightPush = () => {
    addConsoleLog([
      `[CONTROL] Heartbeat request received from Central Platform Control Plane.`,
      `[CONTROL] Node status reported: HEALTHY | RocksDB partitions: 100% synced.`,
      `[CONTROL] Push instruction received: UPDATE_MODEL_ORCHESTRATOR_WEIGHTS`,
      `[MODEL] Downloading latest weights from registry: Ensemble-DeepTrust-v3.2-Beta`,
      `[MODEL] Source: central-model-registry.enstream.ca/models/v32_beta.bin`,
      `[MODEL] Verifying payload signature: SHA-256 checksum matched.`,
      `[MODEL] Hot-swapping weights in local inference cache. Previous version: v3.1`,
      `[SUCCESS] Weights updated. Dynamic routing table updated: Accuracy=8, Latency=6, Explainability=6.`
    ]);
  };

  const triggerSchemaComplianceAudit = () => {
    addConsoleLog([
      `[CONTROL] Initiating automated local data compliance scanner...`,
      `[AUDIT] Scanning active RocksDB schemas... 12 partitions scanned. 0 structural errors.`,
      `[AUDIT] Scanning Apache Iceberg metadata... Metadata version 4 verified.`,
      `[SHIELD] Running PII regex sweep over feature values...`,
      `[SHIELD] Scanning columns: hashed_msisdn, sim_swap_count_2h, device_switch_count_24h`,
      `[SHIELD] 0 plaintext phone numbers (MSISDN) detected.`,
      `[SHIELD] 0 plaintext IP addresses detected.`,
      `[SHIELD] 0 plaintext customer names or emails detected.`,
      `[SUCCESS] All schemas fully compliant with Zero-PII EnStream Data Sharing agreement. Compliance signature generated.`
    ]);
  };

  const runPipelineSimulation = () => {
    setPipelineStep(1);
    setIsPipelineRunning(true);
  };

  useEffect(() => {
    let timer: any;
    if (isPipelineRunning && pipelineStep > 0 && pipelineStep < 4) {
      timer = setTimeout(() => {
        setPipelineStep((prev) => prev + 1);
      }, 2000);
    } else if (pipelineStep === 4) {
      setIsPipelineRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isPipelineRunning, pipelineStep]);

  // --- Onboarding Features Option List ---
  const availableFeatures = [
    { id: "subscriber_tenure", label: "Subscriber Tenure" },
    { id: "sim_swap_count", label: "SIM Swap Count" },
    { id: "device_trust", label: "Device Trust" },
    { id: "ownership_stability", label: "Ownership Stability" },
    { id: "fraud_history", label: "Fraud History" },
    { id: "fraud_exposure", label: "Fraud Exposure Index" }
  ];

  const handleToggleOnboardFeature = (id: string) => {
    if (onboardFeatures.includes(id)) {
      setOnboardFeatures(onboardFeatures.filter(f => f !== id));
    } else {
      setOnboardFeatures([...onboardFeatures, id]);
    }
  };

  // Run Onboarding Deployment Simulation
  const handleDeployOnboardNode = () => {
    setOnboardLoading(true);
    setOnboardLogs([]);
    let currentLogs: string[] = [];
    
    const logs = [
      `[INFO] Initializing EnStream Trust Node container for "${onboardName}"...`,
      `[INFO] Establishing connectivity secure channels via ${onboardConnectivity}...`,
      `[SUCCESS] Bidirectional tunnel created. Handshake verified.`,
      `[INFO] Building local Feature Engine pipeline for: ${onboardFeatures.join(", ")}...`,
      `[INFO] Synchronizing online/offline feature store metadata catalogs...`,
      `[INFO] Instantiating Privacy Gateway boundary rules. Enforcing allowed fields.`,
      `[INFO] Applying Data Contracts: PII blocked at participant source boundary.`,
      `[SUCCESS] Node security handshake completed. PII Shield: ACTIVE.`,
      `[SUCCESS] Onboarding complete. EnStream Node deployed successfully in sandbox mode!`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        currentLogs.push(log);
        setOnboardLogs([...currentLogs]);
        if (index === logs.length - 1) {
          setOnboardLoading(false);
          setOnboardFinished(true);
        }
      }, (index + 1) * 400);
    });
  };

  const handleResetOnboard = () => {
    setOnboardStep(1);
    setOnboardName("");
    setOnboardIndustry("Telco");
    setOnboardConnectivity("Kafka");
    setOnboardFeatures(["subscriber_tenure", "sim_swap_count"]);
    setOnboardFinished(false);
    setOnboardLogs([]);
  };

  // Run Real-Time Exchange Simulation
  const runExchangeSimulation = () => {
    setExchangeQueryActive(true);
    setExchangeResults(null);
    setExchangeLogs([]);
    
    let logs: string[] = [];
    const steps = [
      "Bank requests Trust Score validation for customer connection...",
      "Resolving participant features from Federated Data Exchange layers...",
      "Rogers Node: Returning Local Subscriber Tenure & SIM Swaps (PII Blocked)...",
      "Bell Node: Returning Local Ownership Stability & Fraud History (PII Blocked)...",
      "Fraud Bureau Node: Returning Exposure Index (PII Blocked)...",
      "Federation Gateway: Combining conformed anonymous trust signals...",
      "Feature Engine: Running score model pipeline inference...",
      "Result Computed: Trust Score served in 65ms."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        logs.push(step);
        setExchangeLogs([...logs]);
        if (index === steps.length - 1) {
          // Compute score based on variables
          let baseScore = 800;
          if (exRogersTenure === "New (< 3 months)") baseScore -= 180;
          if (exRogersTenure === "Medium (1-2 years)") baseScore -= 50;
          baseScore -= exRogersSimSwap * 120;
          if (exRogersDeviceTrust === "Low") baseScore -= 150;
          if (exBellOwnership === "Unstable") baseScore -= 100;
          baseScore -= exBellFraudHistory * 200;
          if (exBureauExposure === "High") baseScore -= 150;
          if (exBureauExposure === "Medium") baseScore -= 70;

          // Clamp
          const finalScore = Math.max(100, Math.min(990, baseScore));
          let riskTier = "Low Risk";
          let riskColor = "text-emerald-400";
          let bgCol = "bg-emerald-500/10 border-emerald-500/20";
          if (finalScore < 700) {
            riskTier = "Medium Risk";
            riskColor = "text-amber-400";
            bgCol = "bg-amber-500/10 border-amber-500/20";
          }
          if (finalScore < 450) {
            riskTier = "High Risk";
            riskColor = "text-rose-400";
            bgCol = "bg-rose-500/10 border-rose-500/20";
          }

          setExchangeResults({
            score: finalScore,
            tier: riskTier,
            color: riskColor,
            bg: bgCol,
            confidence: Math.round(90 + Math.random() * 9),
            reasons: finalScore < 600 
              ? ["Elevated SIM swaps detected recently", "Unstable customer tenure on provider network"]
              : ["Long network tenure verified", "Stable device association", "No active fraud associations"]
          });
          setExchangeQueryActive(false);
        }
      }, (index + 1) * 300);
    });
  };

  // Run Real-Time Lifecycle Simulation Step-by-Step
  const triggerLifecycleSimulation = () => {
    setLifecycleStep(1);
    setLifecycleRunning(true);
    
    const runStep = (stepNum: number) => {
      setTimeout(() => {
        setLifecycleStep(stepNum);
        if (stepNum < 9) {
          runStep(stepNum + 1);
        } else {
          setLifecycleRunning(false);
        }
      }, 700);
    };
    runStep(2);
  };

  // Unstructured Text Processing Simulation
  const processUnstructuredText = () => {
    setNlpProcessing(true);
    setTimeout(() => {
      setNlpResults({
        sentiment: "Highly Risk-Related",
        fraudMentionScore: 8.8,
        entities: [
          { type: "MSISDN", value: "4165551234" },
          { type: "IP Address Block", value: "Multiple SIM swap requests" },
          { type: "Carrier", value: "Bell partner gateway" }
        ],
        similarCases: "92% similarity to SIM Swap attack sequence pattern",
        generatedFeatures: [
          { name: "fraud_mention_count", value: "3" },
          { name: "carrier_notes_risk_sentiment", value: "0.89 (Very Negative)" },
          { name: "cross_incident_cooccurrence", value: "High Similarity" }
        ]
      });
      setNlpProcessing(false);
    }, 1200);
  };

  // Run Orchestrator Score computation
  const getModelMeritScore = (model: any) => {
    const accuracyVal = model === "challenger" ? challengerMetrics.accuracy : championMetrics.accuracy;
    const latencyVal = model === "challenger" ? challengerMetrics.latency : championMetrics.latency;
    const driftVal = model === "challenger" ? challengerMetrics.drift : championMetrics.drift;
    
    // Normalize and weigh
    const accWeight = orchestratorWeights.accuracy;
    const latWeight = orchestratorWeights.latency;
    const freshWeight = orchestratorWeights.freshness;

    // Merit metric score formula
    const accScore = (accuracyVal / 100) * 10 * accWeight;
    const latScore = (1 - (latencyVal / 100)) * 10 * latWeight;
    const driftScore = (1 - driftVal) * 10 * freshWeight;

    return Math.round((accScore + latScore + driftScore) / (accWeight + latWeight + freshWeight) * 10);
  };

  useEffect(() => {
    const challScore = getModelMeritScore("challenger");
    const champScore = getModelMeritScore("champion");
    
    if (challScore > champScore) {
      setSelectedOrchestratedModel(challengerMetrics.name);
    } else {
      setSelectedOrchestratedModel(championMetrics.name);
    }
  }, [orchestratorWeights, challengerMetrics, championMetrics]);

  // Screen descriptions
  const screens = [
    {
      id: 0,
      title: "Executive Overview",
      subtitle: "Federated Trust Network",
      sub: "Data Stays Local. Intelligence is Shared. Decisions are Centralized.",
      category: "overview"
    },
    {
      id: 1,
      title: "Data Sovereignty Architecture",
      subtitle: "Executive Question: How is data retained at source provider?",
      category: "sovereignty"
    },
    {
      id: 2,
      title: "Federated Trust Node Architecture",
      subtitle: "Executive Question: How is data federated across multiple sources?",
      category: "node"
    },
    {
      id: 3,
      title: "Trust Intelligence Exchange Simulation",
      subtitle: "Executive Question: How does scoring work if data stays local?",
      category: "exchange"
    },
    {
      id: 4,
      title: "Real-Time Trust Lifecycle",
      subtitle: "Executive Question: How is sub-second response achieved?",
      category: "lifecycle"
    },
    {
      id: 5,
      title: "Subex HyperSense Comparison",
      subtitle: "Executive Question: How does Subex achieve sub-second performance?",
      category: "hypersense"
    },
    {
      id: 6,
      title: "Unstructured Intelligence",
      subtitle: "Executive Question: How does the platform support unstructured data?",
      category: "unstructured"
    },
    {
      id: 7,
      title: "ML Observability Center",
      subtitle: "Executive Question: What replaces MLflow-only observability?",
      category: "observability"
    },
    {
      id: 8,
      title: "Merit-Based ML Orchestration",
      subtitle: "Executive Question: How does Incedo ML Orchestrator perform merit-based orchestration?",
      category: "orchestrator"
    },
    {
      id: 9,
      title: "Snowflake vs Databricks Evaluation",
      subtitle: "Executive Question: Alternative platform considerations",
      category: "snowflake_databricks"
    },
    {
      id: 10,
      title: "Telco Verify Alignment",
      subtitle: "Executive Question: How much does Telco Verify align with this architecture?",
      category: "telco_verify"
    },
    {
      id: 11,
      title: "Participant Onboarding Workbench",
      subtitle: "Executive Question: How are participants onboarded with minimal effort?",
      category: "onboarding"
    },
    {
      id: 12,
      title: "Risks & Assumptions Matrix",
      subtitle: "Project Strategy: Realizing governance and mitigations",
      category: "risks"
    },
    {
      id: 13,
      title: "MLOps Operating Model",
      subtitle: "Project Strategy: Enterprise operational framework",
      category: "mlops"
    },
    {
      id: 14,
      title: "Team Structure & Responsibilities",
      subtitle: "Project Strategy: Team allocation and delivery ownership model",
      category: "team"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER WITH SLIDE SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] uppercase font-mono tracking-widest text-blue-500 font-bold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Platform Evolution Storyboard</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">{screens[activeScreen].title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{screens[activeScreen].subtitle}</p>
        </div>

        <div className="flex items-center justify-end space-x-2 text-xs shrink-0 select-none">
          <button 
            disabled={activeScreen === 0}
            onClick={() => setActiveScreen(activeScreen - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <select 
            value={activeScreen}
            onChange={(e) => setActiveScreen(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none font-bold min-w-56 cursor-pointer"
          >
            {screens.map(s => (
              <option key={s.id} value={s.id}>
                Screen {s.id + 1}: {s.title}
              </option>
            ))}
          </select>

          <button 
            disabled={activeScreen === screens.length - 1}
            onClick={() => setActiveScreen(activeScreen + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* RENDER THE ACTIVE SCREEN PAGE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* LEFT COLUMN: THEORETICAL PRESENTATION & BULLETS */}
        <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            
            {/* Screen Number Badge */}
            <div className="flex items-center justify-between">
              <span className="bg-blue-600/10 text-blue-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/20">
                SCREEN {activeScreen + 1} OF 15
              </span>
              <span className="text-slate-500 font-mono text-[10px] font-medium uppercase">
                Category: {screens[activeScreen].category}
              </span>
            </div>

            {/* Title / Subtitle inside bullet panel */}
            <div>
              <h3 className="text-base font-extrabold text-slate-100 tracking-wide">
                {screens[activeScreen].title}
              </h3>
              {screens[activeScreen].id === 0 && (
                <p className="text-xs text-blue-400 font-medium italic mt-1">
                  "{screens[0].sub}"
                </p>
              )}
            </div>

            {/* Bullets Detail Section */}
            <div className="space-y-4 text-slate-300">
              
              {/* Screen 1: Executive Overview */}
              {activeScreen === 0 && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Data Sovereignty First</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Data remains local at participant sources. PII never crosses provider boundaries, maintaining absolute user consent and data sovereignty rules.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                      <Share2 className="w-4 h-4 text-blue-400" />
                      <span>Federated Intelligence Exchange</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Instead of raw databases, participants share anonymized trust signals and pre-computed risk features through unified gateways.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Real-Time scoring decisioning</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pre-computed feature engines and caching deliver real-time trust decisions in milliseconds during transactions.
                    </p>
                  </div>
                </div>
              )}

              {/* Screen 2: Data Sovereignty */}
              {activeScreen === 1 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Source retention:</strong> All raw billing, subscriber registry, and CRM transaction histories remain within Rogers, Bell, Telus, Banks, and Fraud Bureau local databases.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Privacy Gateway Shield:</strong> Masking algorithms block any PII metadata (Names, Emails, Exact Locations) from leaving the participant bounds.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Local Policy Auditing:</strong> Each participant controls feature retention time limits, access logging, and credential keys autonomously.</span>
                  </li>
                </ul>
              )}

              {/* Screen 3: Trust Node Architecture */}
              {activeScreen === 2 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Local Connectors:</strong> Direct connections to local databases (Oracle, Snowflake, Kafka streams) ingest internal records.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Feature store engine:</strong> Pre-calculates signals (SIM swap count, ownership tenure, device security) locally in Redis/DynamoDB tables.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Federation contracts:</strong> Restricts feature transfer payload to approved data structures, verified by data contract policies.</span>
                  </li>
                </ul>
              )}

              {/* Screen 4: Intelligence Exchange Simulation */}
              {activeScreen === 3 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Decoupled features:</strong> Real-time queries assemble scores from distributed features, bypassing central raw storage databases.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Rogers Features:</strong> Tenure, active SIM swaps, device integrity.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Bell & Bureau Features:</strong> Ownership duration, fraud events record, and blacklists exposure.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Aggregation Layer:</strong> Combines anonymized trust variables into a composite trust evaluation instantly.</span>
                  </li>
                </ul>
              )}

              {/* Screen 5: Real-Time Lifecycle */}
              {activeScreen === 4 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Pre-Computation:</strong> Scoring response is sub-second because features are computed as events occur, not during API requests.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Proactive triggers:</strong> An event like a SIM swap triggers local re-evaluation, pushing changes directly to the Redis cache.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Pre-caching:</strong> Active API queries retrieve scores from high-speed caching nodes, avoiding long database joins.</span>
                  </li>
                </ul>
              )}

              {/* Screen 6: HyperSense Comparison */}
              {activeScreen === 5 && (
                <div className="space-y-3 text-xs text-slate-300">
                  <p>
                    <strong>Subex HyperSense</strong> relies heavily on real-time stream updates feeding in-memory caching layers to compute network scores.
                  </p>
                  <p>
                    <strong>EnStream Pattern</strong> implements a similar event-driven flow, but adds a local federated trust boundary. Score updates are pre-computed locally and cached at the federation layer to safeguard carrier data.
                  </p>
                  <p className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 p-2 rounded-lg">
                    Both architectures demonstrate that sub-second latency is only achievable when avoiding request-time relational DB joins.
                  </p>
                </div>
              )}

              {/* Screen 7: Unstructured Intelligence */}
              {activeScreen === 6 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Unstructured Sources:</strong> Customer logs, manual fraud files, device telemetry, case summaries.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Parsing & Embeddings:</strong> LLMs process logs to extract key entities and transform narratives into numerical vector representations.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Trust Features:</strong> Converts text semantics into numerical risk factors (e.g., Risk Sentiment index).</span>
                  </li>
                </ul>
              )}

              {/* Screen 8: ML Observability Center */}
              {activeScreen === 7 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Full-stack monitoring:</strong> Replaces static metric logs with active observability monitoring.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Feature Drift:</strong> Evaluates distribution variance over time using PSI metrics.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Prediction Drift:</strong> Signals warning alerts if average scoring outputs start skewing abnormally.</span>
                  </li>
                </ul>
              )}

              {/* Screen 9: Merit-Based ML Orchestration */}
              {activeScreen === 8 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Dynamical Model Routing:</strong> Evaluates incoming transaction contexts and chooses the optimal model.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Performance Merits:</strong> Ranks models based on accuracy, response latency, confidence, freshness, explainability, and cost.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Fail-Safe Backup:</strong> Switches to simpler, lower-latency models automatically during traffic surges.</span>
                  </li>
                </ul>
              )}

              {/* Screen 10: Snowflake vs Databricks */}
              {activeScreen === 9 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Databricks Strengths:</strong> Native Spark engine, MLflow repository integration, Delta Sharing. Best for ML pipeline orchestration.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Snowflake Strengths:</strong> High-performance SQL queries, direct data exchange sharing, low maintenance. Best for structured analytics.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Recommendation:</strong> AWS-native services with Databricks for real-time model scoring and pipeline logic.</span>
                  </li>
                </ul>
              )}

              {/* Screen 11: Telco Verify Alignment */}
              {activeScreen === 10 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Shared foundations:</strong> Standard API Gateway configurations, authentication models, and real-time query parameters share 80% alignment.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Network Evolution:</strong> Extends current single-carrier scoring into a multi-carrier federated bad actor clearinghouse.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Ecosystem ready:</strong> Lays groundwork to onboard banking partners, utility providers, and ecommerce vendors securely.</span>
                  </li>
                </ul>
              )}

              {/* Screen 12: Onboarding Workbench */}
              {activeScreen === 11 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Self-service onboarding:</strong> Automated setup wizard provisions a configured container in 30 minutes.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Schema matching:</strong> Maps carrier subscriber database schemas to standard EnStream feature formats automatically.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Privacy contracts:</strong> Instantly generates security certificates, data masking rules, and audit configurations.</span>
                  </li>
                </ul>
              )}

              {/* Screen 13: Risks & Assumptions */}
              {activeScreen === 12 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Assumptions:</strong> Participants possess active REST interfaces, clean transactional databases, and valid API keys.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Risks:</strong> Variable schema structures, policy changes, network data volumes, and delayed labels.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Mitigations:</strong> Low-code connector libraries, strict SLA verification nodes, local cache buffers, and daily feedback sync pipelines.</span>
                  </li>
                </ul>
              )}

              {/* Screen 14: MLOps Operating Model */}
              {activeScreen === 13 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Enterprise standards:</strong> Enforces governance parameters, CI/CD automated validation tests, and model registries.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Automated retraining:</strong> Triggers model rebuilds in Dataproc serverless when performance falls below threshold limits.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Regulatory compliance:</strong> Explainable SHAP and LIME scoring logs verify fair decisions for audit trails.</span>
                  </li>
                </ul>
              )}

              {/* Screen 15: Team Structure */}
              {activeScreen === 14 && (
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Program Lead & Architect:</strong> Direct coordination, roadmap milestones tracking, and node connectivity setups.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Engineering Teams:</strong> Spark pipelines, dbt, Flink SQL streaming, and API gateways maintenance.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Observability & MLOps:</strong> Feature drift tracking, model registry promotion, and infrastructure health.</span>
                  </li>
                </ul>
              )}
              
            </div>
          </div>

          {/* BOTTOM STORY SUMMARY CONCLUDING TEXT */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-450 italic leading-relaxed">
            {activeScreen === 14 ? (
              <span className="text-blue-400 font-bold block not-italic mb-1">Final Executive Summary:</span>
            ) : null}
            "EnStream evolves from a centralized Trust Scoring Platform into a Federated Trust Intelligence Network where participants retain ownership of their data, Trust Nodes generate intelligence locally, approved signals are exchanged securely, trust scores are continuously updated, and enterprise customers receive real-time, explainable trust decisions and proactive fraud intelligence."
          </div>
        </div>

        {/* RIGHT COLUMN: RICH VISUAL INTERACTIVE SIMULATORS */}
        <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 flex flex-col justify-center min-h-[500px]">
            
            {/* SCREEN 1: EXECUTIVE OVERVIEW METRICS */}
            {activeScreen === 0 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Participants Connected</span>
                    <span className="text-2xl font-black text-slate-100 block mt-1 tracking-tight">14</span>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> Rogers, Bell, Telus, +11 Banks
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Trust Nodes Active</span>
                    <span className="text-2xl font-black text-blue-400 block mt-1 tracking-tight">28</span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">Dual-redundant active containers</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Trust Scores Served</span>
                    <span className="text-2xl font-black text-slate-100 block mt-1 tracking-tight">12.8M</span>
                    <span className="text-[9px] text-blue-400 font-mono block mt-1">Average 450 transactions/second</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Fraud Events Prevented</span>
                    <span className="text-2xl font-black text-rose-450 block mt-1 tracking-tight">34,192</span>
                    <span className="text-[9px] text-rose-400 font-mono block mt-1">$4.2M estimated loss savings</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Average API Latency</span>
                    <span className="text-2xl font-black text-emerald-450 block mt-1 tracking-tight">62 ms</span>
                    <span className="text-[9px] text-emerald-400 font-mono block mt-1">100% pre-computed cache hits</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md">
                    <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Privacy Compliance</span>
                    <span className="text-2xl font-black text-slate-100 block mt-1 tracking-tight">100%</span>
                    <span className="text-[9px] text-blue-450 font-mono block mt-1">Zero raw data exchanges</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Centralized scoring vs Federated Intelligence</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                      EnStream replaces centralized raw data warehouses with a distributed, privacy-preserving consensus clearinghouse. Data resides securely at the carrier or banking node, and only validated metadata signals are shared.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-mono font-bold px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/25 rounded-lg shrink-0">
                    <Network className="w-4 h-4 animate-pulse" />
                    <span>FEDERATED MODE: ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: DATA SOVEREIGNTY ARCHITECTURE */}
            {activeScreen === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono bg-blue-950 border border-blue-800/50 px-3 py-1 rounded-full text-blue-400 font-bold">
                    Raw Data Boundary Limit - Security Level: High
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { name: "Rogers", color: "border-red-500/20 hover:border-red-500/40" },
                    { name: "Bell", color: "border-blue-500/20 hover:border-blue-500/40" },
                    { name: "Telus", color: "border-emerald-500/20 hover:border-emerald-500/40" },
                    { name: "CIBC / Banks", color: "border-purple-500/20 hover:border-purple-500/40" },
                    { name: "Fraud Bureau", color: "border-amber-500/20 hover:border-amber-500/40" }
                  ].map((provider, i) => (
                    <div key={i} className={`bg-slate-950 p-4 rounded-xl border ${provider.color} transition-all duration-300 text-center relative group`}>
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                      <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">{provider.name}</h4>
                      
                      <div className="mt-3 space-y-1.5 text-[9px] text-slate-500 font-mono text-left bg-slate-900/60 p-2 rounded">
                        <div>• Subscriber CRM</div>
                        <div>• Device Systems</div>
                        <div>• Billing Log</div>
                        <div>• Local Fraud DB</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-900 text-[9px] font-bold text-red-400/90 flex items-center justify-center space-x-1 uppercase">
                        <Shield className="w-3 h-3 shrink-0" />
                        <span>Raw Blocked</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-md">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Local Privacy Shield & Contract Gatekeeper</h4>
                      <p className="text-[10.5px] text-slate-400 max-w-md mt-0.5">
                        PII fields (name, exact IP, SIN, email) are scrubbed at local participant nodes. Only high-level risk features are extracted and encrypted.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 text-right text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-850">
                    <div><span className="text-red-400 font-bold">PII Blocked:</span> 100%</div>
                    <div><span className="text-emerald-400 font-bold">Customer Data:</span> Local Only</div>
                    <div><span className="text-blue-400 font-bold">Retention Policy:</span> Owner Controlled</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: FEDERATED TRUST NODE ARCHITECTURE */}
            {activeScreen === 2 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* SUB-TABS FOR DETAILS */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0 select-none">
                  <button
                    onClick={() => setNodeSubTab("functional")}
                    className={`flex-1 py-2 text-center rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "functional" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Functional Ingestion Pipeline
                  </button>
                  <button
                    onClick={() => setNodeSubTab("technical")}
                    className={`flex-1 py-2 text-center rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "technical" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Technical Stack Spec
                  </button>
                  <button
                    onClick={() => setNodeSubTab("interaction")}
                    className={`flex-1 py-2 text-center rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "interaction" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Interaction Protocol Console
                  </button>
                </div>

                {/* SUBTAB 1: FUNCTIONAL INGESTION PIPELINE */}
                {nodeSubTab === "functional" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative overflow-hidden space-y-4">
                      
                      {/* Scenario Picker */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">Select Telemetry Scenario</span>
                          <span className="text-xs font-bold text-slate-200">{scenariosData[activePayloadScenario].name}</span>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                          <button
                            onClick={() => { setActivePayloadScenario("normal"); setPipelineStep(1); }}
                            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                              activePayloadScenario === "normal" ? "bg-blue-600/30 text-blue-400 border border-blue-500/40" : "bg-slate-950 text-slate-450 border border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            Normal Attach
                          </button>
                          <button
                            onClick={() => { setActivePayloadScenario("sim_swap"); setPipelineStep(1); }}
                            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                              activePayloadScenario === "sim_swap" ? "bg-purple-600/30 text-purple-400 border border-purple-500/40" : "bg-slate-950 text-slate-450 border border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            SIM Swap Attack
                          </button>
                          <button
                            onClick={() => { setActivePayloadScenario("location"); setPipelineStep(1); }}
                            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                              activePayloadScenario === "location" ? "bg-amber-600/30 text-amber-400 border border-amber-500/40" : "bg-slate-950 text-slate-450 border border-slate-800 hover:text-slate-300"
                            }`}
                          >
                            Location Hop
                          </button>
                        </div>
                      </div>

                      {/* Pipeline steps indicator */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: "ingress", step: 1, name: "1. Raw Ingress", color: "text-blue-400 border-blue-500/20" },
                          { key: "engine", step: 2, name: "2. RocksDB Engine", color: "text-purple-400 border-purple-500/20" },
                          { key: "privacy", step: 3, name: "3. PII Shield", color: "text-red-400 border-red-500/20" },
                          { key: "gateway", step: 4, name: "4. JWE Gate", color: "text-emerald-400 border-emerald-500/20" }
                        ].map((stage) => {
                          const isVisited = pipelineStep >= stage.step;
                          const isCurrent = pipelineStep === stage.step || (pipelineStep === 0 && stage.step === 1);
                          return (
                            <button
                              key={stage.key}
                              onClick={() => { setPipelineStep(stage.step); setIsPipelineRunning(false); }}
                              className={`p-2.5 rounded-lg border text-center transition-all ${
                                isCurrent 
                                  ? "bg-slate-900 border-blue-500/80 shadow-md scale-[1.02]" 
                                  : isVisited 
                                    ? "bg-slate-900/60 border-slate-800 opacity-90" 
                                    : "bg-slate-950 border-slate-900 opacity-40 hover:opacity-60"
                              }`}
                            >
                              <span className={`text-[10px] font-mono font-bold block ${stage.color}`}>{stage.name}</span>
                              <span className="text-[8px] text-slate-500 block mt-0.5 uppercase tracking-wider">
                                {isCurrent ? "Active" : isVisited ? "Processed" : "Pending"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Step payload view */}
                      {(() => {
                        const stepKey = pipelineStep === 4 ? "gateway" : pipelineStep === 3 ? "privacy" : pipelineStep === 2 ? "engine" : "ingress";
                        const stepData = scenariosData[activePayloadScenario][stepKey];
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch mt-4">
                            
                            {/* Input Code Block */}
                            <div className="md:col-span-5 flex flex-col space-y-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Input Payload</span>
                              <pre className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-[9.5px] font-mono text-slate-300 overflow-x-auto h-40 leading-normal">
                                {stepData.input}
                              </pre>
                            </div>

                            {/* Center Flow arrow with details */}
                            <div className="md:col-span-2 flex flex-col justify-center items-center text-center p-2 border border-slate-850/65 rounded-lg bg-slate-900/40 relative">
                              <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                              <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider block mb-1">Transform</span>
                              <ArrowRight className="w-5 h-5 text-blue-500 animate-pulse my-1" />
                              <p className="text-[9px] leading-tight text-slate-450 mt-1 max-w-xs">{stepData.description}</p>
                            </div>

                            {/* Output Code Block */}
                            <div className="md:col-span-5 flex flex-col space-y-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Output Result</span>
                              <pre className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-[9.5px] font-mono text-emerald-455 overflow-x-auto h-40 leading-normal">
                                {stepData.output}
                              </pre>
                            </div>

                          </div>
                        );
                      })()}

                      {/* Controls */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                        <div className="text-[9px] font-mono text-slate-500">
                          {isPipelineRunning ? "Running simulation timer..." : "Interactive Mode: Click steps or run simulation"}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setPipelineStep(1); setIsPipelineRunning(false); }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 text-[10px] font-mono font-bold rounded cursor-pointer"
                          >
                            Reset Step
                          </button>
                          <button
                            onClick={runPipelineSimulation}
                            disabled={isPipelineRunning}
                            className="px-3.5 py-1.5 bg-blue-600/10 border border-blue-500/25 text-blue-400 hover:bg-blue-600 hover:text-slate-100 text-[10px] font-mono font-bold rounded flex items-center space-x-1.5 cursor-pointer shadow-md"
                          >
                            <Play className="w-3 h-3" />
                            <span>Auto-Run Ingestion</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUBTAB 2: TECHNICAL STACK SPEC */}
                {nodeSubTab === "technical" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* Selector cards */}
                        <div className="lg:col-span-4 flex flex-col space-y-2 select-none">
                          {[
                            { key: "kafka", name: "Kafka Streams / Flink SQL", desc: "Telemetry event ingress", icon: Database },
                            { key: "rocksdb", name: "RocksDB State Store", desc: "Low-latency stateful store", icon: Cpu },
                            { key: "iceberg", name: "Apache Iceberg Table", desc: "Conformed local analytics", icon: Table },
                            { key: "jwe", name: "JOSE JWE Envelope", desc: "Cryptographic secure signing", icon: Shield },
                            { key: "grpc", name: "gRPC Protobuf Schema", desc: "Transport layer contract", icon: Share2 }
                          ].map((card) => {
                            const Icon = card.icon;
                            return (
                              <button
                                key={card.key}
                                onClick={() => setActiveTechCard(card.key as any)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  activeTechCard === card.key 
                                    ? "bg-blue-600/10 border-blue-500 text-blue-300" 
                                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-355"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                                  <span className="text-[10.5px] font-bold tracking-tight">{card.name}</span>
                                </div>
                                <span className="text-[8.5px] text-slate-500 block mt-0.5 font-mono">{card.desc}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Code Spec Viewer */}
                        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-850 rounded-xl overflow-hidden p-4 space-y-3">
                          {activeTechCard === "kafka" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">Flink SQL / Kafka Ingress Schema</span>
                                <span className="text-[9px] font-mono text-slate-500">v1.12.0 • Ingress Layer</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans">
                                Event-driven ingestion pipeline consumes telemetry events from localized Kafka topics, validating fields and declaring watermarks for stateful processing.
                              </p>
                              <pre className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[9.5px] font-mono text-blue-300 overflow-x-auto max-h-56 leading-normal">
{`CREATE TEMPORARY TABLE raw_telemetry_ingress (
  msisdn STRING,
  imsi STRING,
  event_type STRING,
  ts TIMESTAMP(3),
  cell_tower_id STRING,
  imei STRING,
  WATERMARK FOR ts AS ts - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'rogers.telemetry.events',
  'format' = 'json'
);

-- Compute SIM swaps in a rolling 2-hour window
CREATE VIEW stateful_sim_swaps AS
SELECT 
  msisdn,
  COUNT(imsi) OVER (
    PARTITION BY msisdn 
    ORDER BY ts 
    RANGE BETWEEN INTERVAL '2' HOUR PRECEDING AND CURRENT ROW
  ) as sim_swap_count_2h
FROM raw_telemetry_ingress
WHERE event_type = 'SIM_SWAP_REQUEST';`}
                              </pre>
                            </div>
                          )}

                          {activeTechCard === "rocksdb" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">Java RocksDB Stateful Store API</span>
                                <span className="text-[9px] font-mono text-slate-500">v8.1.1 • Local Feature State</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans">
                                Low-latency key-value state store handles millions of sliding transactions per second, recording aggregates locally prior to anonymization filters.
                              </p>
                              <pre className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[9.5px] font-mono text-purple-300 overflow-x-auto max-h-56 leading-normal">
{`// Configure RocksDB State Store for low-latency aggregates
Options options = new Options().setCreateIfMissing(true);
RocksDB db = RocksDB.open(options, "/var/data/rocksdb/features");

byte[] key = msisdn.getBytes(StandardCharsets.UTF_8);
byte[] value = db.get(key);

FeatureState state;
if (value == null) {
    state = new FeatureState(msisdn, 0, 0, System.currentTimeMillis());
} else {
    state = FeatureState.deserialize(value);
}

// Increment SIM swaps if active event detected
if ("SIM_SWAP_REQUEST".equals(event.getType())) {
    state.incrementSimSwapCount2h();
}

db.put(key, state.serialize());`}
                              </pre>
                            </div>
                          )}

                          {activeTechCard === "iceberg" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">Apache Iceberg DDL Schema</span>
                                <span className="text-[9px] font-mono text-slate-500">v2 Format • Local Analytics Sync</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans">
                                Conformed tables local snapshot sync. Synchronizes the local aggregates into distributed cloud storage partition layers, bypassing centralized transactional engines.
                              </p>
                              <pre className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[9.5px] font-mono text-amber-300 overflow-x-auto max-h-56 leading-normal">
{`-- DDL for Iceberg Federated Feature Sync Table
CREATE TABLE iceberg.db_trust.conformed_features (
  hashed_msisdn STRING COMMENT 'SHA-256 subscriber ID',
  sim_swap_count_2h INT COMMENT 'Count of SIM swaps requested in 2h',
  device_switch_count_24h INT COMMENT 'Device changes in last 24h',
  location_change_count_1h INT COMMENT 'Cell tower jumps in last 1h',
  impossible_travel_flag BOOLEAN COMMENT 'Triggered by physical velocity',
  data_privacy_consent BOOLEAN COMMENT 'Consent flag for scoring',
  last_updated TIMESTAMP COMMENT 'UTC timestamp of calculation'
) 
USING iceberg
PARTITIONED BY (days(last_updated));`}
                              </pre>
                            </div>
                          )}

                          {activeTechCard === "jwe" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">JOSE JWE RFC 7516 Encryption Schema</span>
                                <span className="text-[9px] font-mono text-slate-500">RSA-OAEP + A128GCM • Privacy Shield Egress</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans">
                                Encrypted JSON Web Encryption envelope wraps anonymized feature structures so payloads are safe in transit. Decrypted only inside Central Platform Secure Sandbox bounds.
                              </p>
                              <pre className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[9.5px] font-mono text-red-300 overflow-x-auto max-h-56 leading-normal">
{`// Encrypted payload envelope schema (RFC 7516)
{
  "protected": "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkExMjhHQ00iLCJraWQiOiJub2RlLXJvZ2Vycy0wMSJ9",
  "encrypted_key": "a5B9...[Encrypted CEK]...dF3",
  "iv": "v8k92bNd7a1_qA92",
  "ciphertext": "9J2d_1ka98B...[Ciphertext encrypted features]...sF2",
  "tag": "c928KdBv7ad81aKsd"
}
// Decrypted Payload structure:
// { "sub": "sha256-hash", "iss": "Rogers-East-Node", "exp": 1782234000, "features": {...} }`}
                              </pre>
                            </div>
                          )}

                          {activeTechCard === "grpc" && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-slate-200">gRPC Protobuf Signal Exchange Contract</span>
                                <span className="text-[9px] font-mono text-slate-500">Proto3 Schema • Transport API</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans">
                                Schema contract protocol defines data plane RPC interfaces, securing high-speed feature exchanges across nodes and the central trust platform.
                              </p>
                              <pre className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[9.5px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-normal">
{`syntax = "proto3";

package enstream.trust.v1;

service TrustNodeExchangeService {
  // Query trust features without exchanging raw PII
  rpc QueryFeatures(FeatureRequest) returns (FeatureResponse);
}

message FeatureRequest {
  string hashed_msisdn = 1;
  string query_id = 2;
  int64 timestamp_epoch_ms = 3;
}

message FeatureResponse {
  string encrypted_jwe_envelope = 1; // Encrypted JWE envelope
  string sender_node_id = 2;
  int32 response_status_code = 3; // 200 OK, 403 Consent Denied
  string signature = 4; // Cryptographic node signature
}`}
                              </pre>
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* SUBTAB 3: INTERACTION PROTOCOL CONSOLE */}
                {nodeSubTab === "interaction" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-850 text-[10px] select-none shrink-0">
                          <button
                            onClick={() => setInteractionPlane("data")}
                            className={`px-3 py-1.5 rounded font-bold transition-all ${
                              interactionPlane === "data" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            Data Plane (Signals)
                          </button>
                          <button
                            onClick={() => setInteractionPlane("control")}
                            className={`px-3 py-1.5 rounded font-bold transition-all ${
                              interactionPlane === "control" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-slate-350"
                            }`}
                          >
                            Control Plane (Orchestration)
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-1.5 select-none overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                          {interactionPlane === "data" ? (
                            <>
                              <button
                                onClick={triggerScoringRequest}
                                className="px-2.5 py-1.5 bg-blue-600/10 border border-blue-500/25 text-blue-400 hover:bg-blue-600 hover:text-slate-100 text-[10px] font-mono font-bold rounded cursor-pointer transition-all whitespace-nowrap"
                              >
                                Trigger Query
                              </button>
                              <button
                                onClick={triggerConsentRevocation}
                                className="px-2.5 py-1.5 bg-rose-600/10 border border-rose-500/25 text-rose-450 hover:bg-rose-600 hover:text-slate-100 text-[10px] font-mono font-bold rounded cursor-pointer transition-all whitespace-nowrap"
                              >
                                Sim Revocation
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={triggerModelWeightPush}
                                className="px-2.5 py-1.5 bg-purple-600/10 border border-purple-500/25 text-purple-400 hover:bg-purple-600 hover:text-slate-100 text-[10px] font-mono font-bold rounded cursor-pointer transition-all whitespace-nowrap"
                              >
                                Push Model Update
                              </button>
                              <button
                                onClick={triggerSchemaComplianceAudit}
                                className="px-2.5 py-1.5 bg-emerald-600/10 border border-emerald-500/25 text-emerald-450 hover:bg-emerald-600 hover:text-slate-100 text-[10px] font-mono font-bold rounded cursor-pointer transition-all whitespace-nowrap"
                              >
                                Run Schema Audit
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setInteractionConsoleLogs(["[SYSTEM] Console logs cleared. Waiting for commands..."])}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 text-[10px] font-mono font-bold rounded cursor-pointer transition-all whitespace-nowrap font-bold"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Monospace console logs screen */}
                      <div className="flex flex-col bg-slate-900 border border-slate-850 rounded-xl p-4 overflow-hidden relative">
                        <div className="absolute top-2 right-4 flex items-center space-x-1 font-mono text-[9px] text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Node Interface: ONLINE</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 space-y-1 h-56 overflow-y-auto pr-2 leading-relaxed">
                          {interactionConsoleLogs.map((log, index) => {
                            let logColor = "text-slate-350";
                            if (log.includes("[SUCCESS]")) logColor = "text-emerald-400";
                            else if (log.includes("[WARNING]")) logColor = "text-amber-500 font-bold";
                            else if (log.includes("[ERROR]") || log.includes("Error:") || log.includes("denied") || log.includes("DENIED")) logColor = "text-rose-455";
                            else if (log.includes("[GRPC]")) logColor = "text-blue-400";
                            else if (log.includes("[CONTROL]")) logColor = "text-purple-400";
                            else if (log.includes("[SHIELD]")) logColor = "text-cyan-400";
                            else if (log.includes("[SYSTEM]")) logColor = "text-slate-500";
                            
                            return (
                              <div key={index} className={`${logColor} select-text`}>
                                {log}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Small architecture note */}
                      <p className="text-[10px] text-slate-500 leading-normal font-sans">
                        <strong>Protocol Detail:</strong> Interaction between the Node (Data Sovereignty Layer) and the Central Intelligence Platform is strictly separated. The Data Plane swaps encrypted gRPC signals client-side, while the Control Plane dictates ML weights parameters and schema validation rules asynchronously.
                      </p>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SCREEN 4: TRUST INTELLIGENCE EXCHANGE SIMULATION */}
            {activeScreen === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-3">Live Scoring Simulation Console</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="text-[10px] font-extrabold uppercase text-slate-300 border-b border-slate-800 pb-1 flex justify-between items-center">
                        <span>Rogers Node</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Subscriber Tenure:</label>
                          <select 
                            value={exRogersTenure} 
                            onChange={(e) => setExRogersTenure(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value="New (< 3 months)">New (&lt; 3 months)</option>
                            <option value="Medium (1-2 years)">Medium (1-2 years)</option>
                            <option value="8 Years">Long (8+ years)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Recent SIM Swaps:</label>
                          <select 
                            value={exRogersSimSwap} 
                            onChange={(e) => setExRogersSimSwap(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value={0}>0 swaps</option>
                            <option value={1}>1 swap</option>
                            <option value={3}>3 swaps</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Device Trust Score:</label>
                          <select 
                            value={exRogersDeviceTrust} 
                            onChange={(e) => setExRogersDeviceTrust(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="text-[10px] font-extrabold uppercase text-slate-300 border-b border-slate-800 pb-1 flex justify-between items-center">
                        <span>Bell Node</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Ownership Stability:</label>
                          <select 
                            value={exBellOwnership} 
                            onChange={(e) => setExBellOwnership(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value="Stable">Stable</option>
                            <option value="Unstable">Unstable</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Fraud History Cases:</label>
                          <select 
                            value={exBellFraudHistory} 
                            onChange={(e) => setExBellFraudHistory(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value={0}>0 events</option>
                            <option value={1}>1 event</option>
                            <option value={2}>2+ events</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="text-[10px] font-extrabold uppercase text-slate-300 border-b border-slate-800 pb-1 flex justify-between items-center">
                        <span>Fraud Bureau Node</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Risk Exposure Index:</label>
                          <select 
                            value={exBureauExposure} 
                            onChange={(e) => setExBureauExposure(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[10px] p-1.5 rounded w-full text-slate-300"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={runExchangeSimulation}
                      disabled={exchangeQueryActive}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-slate-100 font-bold rounded-lg text-xs tracking-wider uppercase flex items-center space-x-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${exchangeQueryActive ? "animate-spin" : ""}`} />
                      <span>{exchangeQueryActive ? "COMPUTING COMPOSITE TRUST SCORE..." : "RUN FEDERATED SCORING REQUEST"}</span>
                    </button>
                  </div>
                </div>

                {/* SIMULATION RESULTS */}
                {exchangeResults ? (
                  <div className={`p-4 rounded-xl border ${exchangeResults.bg} animate-fadeIn flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-center bg-slate-950/80 p-3 rounded-xl border border-slate-800 min-w-24">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Trust Score</span>
                        <span className="text-3xl font-black text-slate-100 mt-1 block">{exchangeResults.score}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${exchangeResults.color}`}>{exchangeResults.tier}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-300">Confidence: {exchangeResults.confidence}%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                          {exchangeResults.reasons.map((r: string, idx: number) => (
                            <div key={idx}>• {r}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
                      <div><span className="text-red-400">Raw Data Exchanged:</span> NONE (0 bytes)</div>
                      <div><span className="text-emerald-400">Features Aggregated:</span> Verified Secure</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-850">
                    Adjust variables and click compute to run the federated intelligence simulator.
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 5: REAL-TIME TRUST LIFECYCLE */}
            {activeScreen === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Sub-Second Event Propagation Timeline</h4>
                    <button 
                      onClick={triggerLifecycleSimulation}
                      disabled={lifecycleRunning}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-slate-100 font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{lifecycleRunning ? "PROPAGATING..." : "SIMULATE EVENTS INGRESS"}</span>
                    </button>
                  </div>

                  {/* LIFECYCLE STEPS FLOW */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-mono select-none">
                    {[
                      { step: 1, label: "SIM Swap Event Ingress" },
                      { step: 2, label: "Local Feature Update" },
                      { step: 3, label: "Node Feature Store Recomputation" },
                      { step: 4, label: "Trust Signal Published" },
                      { step: 5, label: "Central Trust Profile Updated" },
                      { step: 6, label: "Trust Score Recomputed" },
                      { step: 7, label: "Redis Active Cache Refresh" },
                      { step: 8, label: "API Served in Milliseconds" }
                    ].map((s) => {
                      const isActive = lifecycleStep >= s.step;
                      const isCurrent = lifecycleStep === s.step;
                      return (
                        <div 
                          key={s.step} 
                          className={`p-3 rounded-lg border transition-all duration-300 ${
                            isCurrent 
                              ? "bg-blue-600/25 border-blue-500 text-slate-100 scale-105 shadow-md"
                              : isActive 
                                ? "bg-slate-900 border-blue-900 text-blue-300"
                                : "bg-slate-950 border-slate-850 text-slate-600"
                          }`}
                        >
                          <div className="font-bold mb-1">STEP {s.step}</div>
                          <div className="leading-tight">{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SPEEDOMETERS LATENCY COMPARISON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Traditional Request-Time Scoring</h5>
                    <div className="flex items-center space-x-3 bg-red-500/5 p-3 rounded border border-red-500/10">
                      <span className="text-xl font-bold text-red-400">2.0 seconds</span>
                      <span className="text-[10px] text-slate-500">
                        Scores computed on-demand: requires direct REST queries to every participant database, facing cold timeouts.
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Event-Driven Caching (EnStream)</h5>
                    <div className="flex items-center space-x-3 bg-emerald-500/5 p-3 rounded border border-emerald-500/10">
                      <span className="text-xl font-bold text-emerald-400">&lt; 100 ms</span>
                      <span className="text-[10px] text-slate-500">
                        Scores continuously pre-computed as features update. Active API fetches serve directly from Redis caches.
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SCREEN 6: HYPERSENSE COMPARISON */}
            {activeScreen === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-5">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-4">Side-by-Side Pattern Mapping</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-3">
                      <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-200">Subex HyperSense Pattern</span>
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded uppercase font-mono">Centralized Cache</span>
                      </div>
                      
                      <div className="space-y-2 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">1</span>
                          <span>Network Event → Stream Bus (Kafka)</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">2</span>
                          <span>Central Feature Update Engine</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">3</span>
                          <span>Centralized Scoring Model Execution</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">4</span>
                          <span>In-Memory Redis / API Layer</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-200">EnStream Federated Pattern</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono">Federated Security</span>
                      </div>
                      
                      <div className="space-y-2 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">1</span>
                          <span>Local Event → Ingress Local Node</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">2</span>
                          <span>Local Node pre-computes local features</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">3</span>
                          <span>Exchange Gateway aggregates signals securely</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded">
                          <span className="w-4 h-4 bg-slate-850 rounded-full flex items-center justify-center text-[9px] text-slate-400">4</span>
                          <span>Decoupled API Caching Cache Refresh</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Both patterns achieve sub-second execution speeds by pre-calculating feature arrays.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 7: UNSTRUCTURED INTELLIGENCE */}
            {activeScreen === 6 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Unstructured Text NLP Processor</h4>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Input Document (Investigation Notes / Fraud Narratives):</label>
                    <textarea 
                      value={unstructuredText}
                      onChange={(e) => setUnstructuredText(e.target.value)}
                      rows={4}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-3 w-full text-xs text-slate-200 outline-none font-mono focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={processUnstructuredText}
                      disabled={nlpProcessing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-100 font-bold rounded-lg text-xs flex items-center space-x-2 cursor-pointer"
                    >
                      {nlpProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>PARSING ENTITIES...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          <span>EXTRACT ENTITIES & EMBEDDINGS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {nlpResults ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="text-[10px] font-bold uppercase text-slate-400">Extracted Entities</h5>
                      <div className="space-y-1.5">
                        {nlpResults.entities.map((ent: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] font-mono bg-slate-900 p-2 rounded">
                            <span className="text-slate-500 uppercase">{ent.type}</span>
                            <span className="text-slate-200 font-bold">{ent.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="text-[10px] font-bold uppercase text-slate-400">Generated NLP Risk Features</h5>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 uppercase">Fraud Sentiment</span>
                          <span className="text-rose-400 font-bold">{nlpResults.sentiment}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 uppercase">Risk Score (0-10)</span>
                          <span className="text-rose-450 font-bold">{nlpResults.fraudMentionScore} / 10</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono bg-slate-900 p-2 rounded">
                          <span className="text-slate-500 uppercase">Similarity Clustered</span>
                          <span className="text-amber-450 font-bold">{nlpResults.similarCases}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-850">
                    Click process to extract numeric features from investigation narrative text files.
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 8: ML OBSERVABILITY CENTER */}
            {activeScreen === 7 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Drift Metrics & SHAP Explainability</h4>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Observe Feature:</span>
                      <select 
                        value={driftFeature}
                        onChange={(e) => setDriftFeature(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-1 rounded text-slate-350 cursor-pointer"
                      >
                        <option value="sim_swap">SIM Swap Drift</option>
                        <option value="device_trust">Device Trust Drift</option>
                        <option value="tenure">Tenure Distribution Drift</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-4">
                      <h5 className="text-[10.5px] font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between">
                        <span>Baseline vs Live Distribution</span>
                        <span className="text-blue-400 font-mono text-[9.5px]">PSI: 0.12 (Normal)</span>
                      </h5>
                      
                      {/* Distribution chart mockup */}
                      <div className="h-28 flex items-end justify-between px-4 pt-4 relative">
                        <div className="absolute inset-x-0 bottom-0 border-b border-slate-800"></div>
                        <div className="w-6 bg-blue-500/40 rounded-t h-1/4"></div>
                        <div className="w-6 bg-blue-500/50 rounded-t h-2/5"></div>
                        <div className="w-6 bg-blue-600 rounded-t h-4/5"></div>
                        <div className="w-6 bg-blue-600 rounded-t h-full"></div>
                        <div className="w-6 bg-blue-500/60 rounded-t h-3/5"></div>
                        <div className="w-6 bg-blue-500/40 rounded-t h-1/3"></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500">
                        <span>Low Score Range</span>
                        <span>High Score Range</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="text-[10.5px] font-bold text-slate-300 border-b border-slate-800 pb-1">SHAP Feature Contributions</h5>
                      
                      <div className="space-y-2">
                        {[
                          { label: "SIM Swap Count", weight: 92, col: "bg-red-500" },
                          { label: "Subscriber Tenure", weight: 74, col: "bg-emerald-500" },
                          { label: "Device Integrity Score", weight: 61, col: "bg-blue-500" },
                          { label: "Fraud Exposure index", weight: 48, col: "bg-amber-500" }
                        ].map((feat, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                              <span>{feat.label}</span>
                              <span>+{feat.weight}% Impact</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className={`${feat.col} h-full`} style={{ width: `${feat.weight}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Governance Platform Strategy:</span>
                  <span className="text-[10px] font-mono bg-blue-950 border border-blue-900 text-blue-400 px-3 py-1 rounded">
                    MLflow governs lifecycle. Arize/Evidently provide observability.
                  </span>
                </div>
              </div>
            )}

            {/* SCREEN 9: MERIT-BASED ML ORCHESTRATION */}
            {activeScreen === 8 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Incedo Model Merit Orchestration Engine</h4>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Weights config */}
                    <div className="md:col-span-5 bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 pb-1">Orchestration Weights</h5>
                      
                      <div className="space-y-2.5 text-[10px]">
                        {[
                          { key: "accuracy", label: "Accuracy weight:" },
                          { key: "latency", label: "Latency efficiency:" },
                          { key: "freshness", label: "Freshness weight:" }
                        ].map((w) => (
                          <div key={w.key} className="space-y-1">
                            <div className="flex justify-between font-mono">
                              <span>{w.label}</span>
                              <span className="text-blue-400 font-bold">{(orchestratorWeights as any)[w.key]} / 10</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              value={(orchestratorWeights as any)[w.key]} 
                              onChange={(e) => setOrchestratorWeights({
                                ...orchestratorWeights,
                                [w.key]: Number(e.target.value)
                              })}
                              className="w-full cursor-pointer accent-blue-500 bg-slate-950 h-1 rounded-full appearance-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Merit scores results */}
                    <div className="md:col-span-7 space-y-3">
                      
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 relative">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">CHALLENGER MODEL</span>
                            <span className="text-xs font-bold text-slate-200">{challengerMetrics.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono block">Calculated Merit</span>
                            <span className="text-xl font-black text-blue-400">{getModelMeritScore("challenger")} / 100</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 relative">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">CHAMPION MODEL</span>
                            <span className="text-xs font-bold text-slate-200">{championMetrics.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono block">Calculated Merit</span>
                            <span className="text-xl font-black text-slate-400">{getModelMeritScore("champion")} / 100</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-450">Active Model Selected:</span>
                  <span className="font-mono text-xs font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-lg">
                    {selectedOrchestratedModel}
                  </span>
                </div>
              </div>
            )}

            {/* SCREEN 10: SNOWFLAKE VS DATABRICKS EVALUATION */}
            {activeScreen === 9 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-3">Architectural Trade-Off Matrix</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10.5px] font-mono text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="pb-2">Evaluation Category</th>
                          <th className="pb-2">Databricks</th>
                          <th className="pb-2">Snowflake</th>
                          <th className="pb-2">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/80 text-slate-350">
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">Data Engineering</td>
                          <td className="py-2.5 text-emerald-400">Excellent (Spark)</td>
                          <td className="py-2.5 text-blue-400">Strong (SQL)</td>
                          <td className="py-2.5">Databricks (ML ETL)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">Streaming Ingress</td>
                          <td className="py-2.5 text-emerald-400">Native Structured Streaming</td>
                          <td className="py-2.5 text-slate-500">Snowpipe basic</td>
                          <td className="py-2.5">Databricks for real-time</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">Feature Store</td>
                          <td className="py-2.5 text-emerald-400">Native feature table mapping</td>
                          <td className="py-2.5 text-slate-500">Requires third-party integrations</td>
                          <td className="py-2.5">Databricks preferred</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">ML Lifecycle</td>
                          <td className="py-2.5 text-emerald-400">Native MLflow Hub</td>
                          <td className="py-2.5 text-blue-400">Snowpark Python</td>
                          <td className="py-2.5">Databricks MLflow native</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">Cross-border Sharing</td>
                          <td className="py-2.5 text-blue-400">Delta Sharing protocol</td>
                          <td className="py-2.5 text-emerald-400">Excellent Direct Exchange</td>
                          <td className="py-2.5">Snowflake for direct SQL</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-200">Cost & Maintenance</td>
                          <td className="py-2.5 text-slate-500">Complex, requires dev attention</td>
                          <td className="py-2.5 text-emerald-400">Low ops, auto-scaling</td>
                          <td className="py-2.5">Snowflake is cheaper for analytics</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-blue-400 font-bold block mb-0.5">Evaluation Outcome:</span>
                  Databricks is highly recommended for ML-centric trust pipelines and online/offline feature store architectures. Snowflake is ideal for BI reporting and SQL-centric data warehouses. The current AWS-native serverless architecture remains recommended for EnStream core pipelines.
                </div>
              </div>
            )}

            {/* SCREEN 11: TELCO VERIFY ALIGNMENT */}
            {activeScreen === 10 && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Gauge indicator */}
                  <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="65" fill="none" stroke="#0f172a" strokeWidth="12" />
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="65" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="12" 
                        strokeDasharray="408"
                        strokeDashoffset="82" // 80% alignment
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-100">80%</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider font-bold">Alignment Score</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Shared Capabilities Matrix</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-slate-350">
                        <span className="text-emerald-400 font-bold block mb-0.5">Shared Foundations:</span>
                        • Identity APIs<br />• Authentication keys<br />• Gateway policies<br />• Caching configurations
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-slate-350">
                        <span className="text-blue-400 font-bold block mb-0.5">Evolution Steps:</span>
                        • Federated node containers<br />• Anonymization rules<br />• Multi-party contracts<br />• Bad Actor clearinghouse
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 text-[10.5px] text-slate-455">
                  <span className="text-blue-400 font-bold block mb-0.5">Consortium Evolution Strategy:</span>
                  By aligning Telco Verify with the Federated Trust Node architecture, EnStream establishes the foundations to expand from single-carrier verifications to a cross-sector fraud database containing real-time trust metrics.
                </div>
              </div>
            )}

            {/* SCREEN 12: PARTICIPANT ONBOARDING WORKBENCH */}
            {activeScreen === 11 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  
                  {/* Steps navigation header */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Self-Service Node Setup Wizard</h4>
                    <div className="flex space-x-1.5 text-[9px] font-mono font-bold select-none">
                      <span className={`px-2 py-0.5 rounded ${onboardStep === 1 ? "bg-blue-600 text-slate-100" : "bg-slate-900 text-slate-500"}`}>1. Participant Details</span>
                      <span className={`px-2 py-0.5 rounded ${onboardStep === 2 ? "bg-blue-600 text-slate-100" : "bg-slate-900 text-slate-500"}`}>2. Security Contracts</span>
                      <span className={`px-2 py-0.5 rounded ${onboardStep === 3 ? "bg-blue-600 text-slate-100" : "bg-slate-900 text-slate-500"}`}>3. Deploy Node</span>
                    </div>
                  </div>

                  {/* Step 1 content */}
                  {onboardStep === 1 && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-500 block font-mono mb-1 font-bold">Participant Provider Name:</label>
                          <input 
                            type="text" 
                            value={onboardName}
                            onChange={(e) => setOnboardName(e.target.value)}
                            placeholder="e.g. Rogers-East-Node"
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 w-full text-xs text-slate-200 font-mono outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block font-mono mb-1 font-bold">Sector Industry Type:</label>
                          <select 
                            value={onboardIndustry}
                            onChange={(e) => setOnboardIndustry(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 w-full text-xs text-slate-350 outline-none"
                          >
                            <option value="Telco">Telecommunications</option>
                            <option value="Banking">Banking & Finance</option>
                            <option value="Government">Government & Registry</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block font-mono mb-1 font-bold">Database Connectivity Interface:</label>
                          <select 
                            value={onboardConnectivity}
                            onChange={(e) => setOnboardConnectivity(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 w-full text-xs text-slate-350 outline-none"
                          >
                            <option value="Kafka">Kafka Real-Time Streams</option>
                            <option value="Snowflake">Snowflake Database</option>
                            <option value="Databricks">Databricks REST API</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3">
                        <button 
                          disabled={!onboardName}
                          onClick={() => setOnboardStep(2)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-slate-100 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <span>CONTINUE TO CONFIGURATION</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 content */}
                  {onboardStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-800 pb-1 mb-3">
                          Select Allowed Shared Features (PII Shield Masking Enforced)
                        </h5>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableFeatures.map(feat => {
                            const selected = onboardFeatures.includes(feat.id);
                            return (
                              <button 
                                key={feat.id}
                                onClick={() => handleToggleOnboardFeature(feat.id)}
                                className={`p-2.5 rounded-lg border text-left text-[10px] font-mono font-bold transition-all ${
                                  selected 
                                    ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                                    : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-400"
                                }`}
                              >
                                <div>{feat.label}</div>
                                <div className="text-[8px] text-slate-500 mt-0.5">
                                  {selected ? "✓ Masked Sharing" : "× Blocked"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between pt-3">
                        <button 
                          onClick={() => setOnboardStep(1)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 font-bold rounded-lg text-xs"
                        >
                          BACK
                        </button>
                        <button 
                          onClick={() => setOnboardStep(3)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-100 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <span>CONTINUE TO DEPLOYMENT</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 content */}
                  {onboardStep === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                      
                      {!onboardFinished && !onboardLoading ? (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-300 font-mono mb-4">
                            Ready to provision Node Container for <span className="text-blue-400 font-bold">"{onboardName}"</span>.
                          </p>
                          <button 
                            onClick={handleDeployOnboardNode}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center space-x-2 mx-auto shadow-lg shadow-emerald-500/20 cursor-pointer"
                          >
                            <Server className="w-4 h-4 animate-pulse" />
                            <span>Provision Node Container</span>
                          </button>
                        </div>
                      ) : null}

                      {/* Log Console Output */}
                      {(onboardLoading || onboardFinished) && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[9.5px] text-slate-400 space-y-1.5 max-h-56 overflow-y-auto">
                          {onboardLogs.map((log, index) => (
                            <div key={index} className="leading-relaxed">
                              {log.includes("SUCCESS") ? (
                                <span className="text-emerald-400">{log}</span>
                              ) : log.includes("Error") ? (
                                <span className="text-rose-400">{log}</span>
                              ) : (
                                <span>{log}</span>
                              )}
                            </div>
                          ))}
                          {onboardLoading && (
                            <div className="flex items-center space-x-1.5 text-blue-400 font-bold animate-pulse mt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              <span>DEPLOYING SYSTEM CONTAINER CLUSTER...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {onboardFinished && (
                        <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                          <span className="text-xs text-emerald-400 font-bold flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Node configured successfully. Estimated activation: 30 minutes.
                          </span>
                          <button 
                            onClick={handleResetOnboard}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 font-bold rounded-lg text-xs cursor-pointer"
                          >
                            RESET WIZARD
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* SCREEN 13: RISKS & ASSUMPTIONS */}
            {activeScreen === 12 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs uppercase font-mono text-amber-500 font-black border-b border-slate-800 pb-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
                      <span>Identified Risks</span>
                    </h4>
                    
                    <div className="space-y-3 text-[11px] text-slate-300 font-mono">
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-red-400 font-bold block mb-0.5">1. Participant Onboarding Friction</span>
                        Varied schema formats and API speeds across carrier platforms could delay ingestion.
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-red-400 font-bold block mb-0.5">2. Privacy & Policy compliance</span>
                        Evolving regulatory limits could restrict feature metrics sharing policies.
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-red-400 font-bold block mb-0.5">3. Data volumes & Scalability</span>
                        Peak network volumes could saturate model orchestration pipelines.
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs uppercase font-mono text-emerald-500 font-black border-b border-slate-800 pb-1 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1.5 shrink-0" />
                      <span>Mitigations</span>
                    </h4>
                    
                    <div className="space-y-3 text-[11px] text-slate-300 font-mono">
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-emerald-400 font-bold block mb-0.5">1. Standardized Connectors</span>
                        Create reusable connector wrappers for Kafka/REST connections to expedite deployment.
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-emerald-400 font-bold block mb-0.5">2. Encrypted Gateway Masks</span>
                        PII boundaries are enforced at container edges via cryptographic hashing.
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-emerald-400 font-bold block mb-0.5">3. Redis Cache Buffering</span>
                        Decouples score computation from active transaction processing routes.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SCREEN 14: MLOPS OPERATING MODEL */}
            {activeScreen === 13 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-4">Continuous Learning Lifecycle</h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[10px] font-mono">
                    {[
                      { step: "01", name: "Feature Governance", desc: "Data contracts & schema validations" },
                      { step: "02", name: "CI/CD Validation", desc: "Automated unit testing & pipeline checks" },
                      { step: "03", name: "Model Registry", desc: "MLflow version cataloging & staging" },
                      { step: "04", name: "Champion/Challenger", desc: "Merit-based live evaluation" },
                      { step: "05", name: "Drift Monitoring", desc: "Active PSI prediction alerts" },
                      { step: "06", name: "Automated Retrain", desc: "Dataproc Serverless rebuild jobs" },
                      { step: "07", name: "Compliance & Explain", desc: "SHAP logs for regulatory validation" },
                      { step: "08", name: "Security Audit", desc: "KMS keys & access audits" },
                      { step: "09", name: "Active Cache Sync", desc: "Redis synchronization pipelines" },
                      { step: "10", name: "Continuous feedback", desc: "Ground-truth labels matching" }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                        <div className="text-blue-500 font-black mb-0.5">{m.step}</div>
                        <div className="text-slate-200 font-bold leading-tight">{m.name}</div>
                        <div className="text-[8.5px] text-slate-500 mt-1 leading-snug">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 15: TEAM STRUCTURE */}
            {activeScreen === 14 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-4">Implementation Team Mapping</h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10.5px]">
                    {[
                      { role: "Program Director", ownership: "Milestones tracking, coordination, stakeholder management" },
                      { role: "Solution Architect", ownership: "Cross-border data structures, REST API architectures" },
                      { role: "Fraud SME", ownership: "Fraud behavior modeling, rules definitions, threshold settings" },
                      { role: "Data Architect", ownership: "Snowflake/Databricks exchange designs, schema definitions" },
                      { role: "Data Engineers", ownership: "dbt workflows, Spark ETL pipelines, Flink streaming query jobs" },
                      { role: "ML Engineers", ownership: "Python model development, parameter tuning, XGBoost logic" },
                      { role: "MLOps Engineer", ownership: "Arize Phoenix drift monitoring, MLflow model registries" },
                      { role: "Platform Engineer", ownership: "Kubernetes containers, Redis caches, AWS security policies" }
                    ].map((member, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-850 space-y-1">
                        <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{member.role}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 leading-relaxed">{member.ownership}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* STORY PROGRESS BAR */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              STORY PROGRESS: {Math.round(((activeScreen + 1) / screens.length) * 100)}%
            </span>
            <div className="flex-1 max-w-lg mx-6 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((activeScreen + 1) / screens.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex space-x-2 select-none">
              <button 
                disabled={activeScreen === 0}
                onClick={() => setActiveScreen(activeScreen - 1)}
                className="px-3.5 py-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-[10px] font-bold uppercase disabled:opacity-30 transition-all cursor-pointer"
              >
                Prev
              </button>
              <button 
                disabled={activeScreen === screens.length - 1}
                onClick={() => setActiveScreen(activeScreen + 1)}
                className="px-3.5 py-1.5 rounded bg-blue-600/10 border border-blue-500/25 text-blue-400 hover:text-slate-100 hover:bg-blue-600 text-[10px] font-bold uppercase disabled:opacity-30 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
