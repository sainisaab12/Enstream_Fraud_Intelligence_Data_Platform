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
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "functional" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Functional Architecture
                  </button>
                  <button
                    onClick={() => setNodeSubTab("technical")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "technical" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Technical Stack Spec
                  </button>
                  <button
                    onClick={() => setNodeSubTab("interaction")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      nodeSubTab === "interaction" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    Central Platform Interaction
                  </button>
                </div>

                {/* FUNCTIONAL ARCHITECTURE SUB-TAB */}
                {nodeSubTab === "functional" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                      <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-3">Trust Node Functional Ingestion & In-Memory Pipeline</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <button 
                          onClick={() => setSelectedFuncBlock("ingress")}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            selectedFuncBlock === "ingress" 
                              ? "bg-blue-600/10 border-blue-500 text-blue-300" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350"
                          }`}
                        >
                          <Database className="w-5 h-5 text-blue-500 mb-1" />
                          <h5 className="text-[10px] font-bold uppercase">1. Data Ingress</h5>
                          <p className="text-[8.5px] mt-1 leading-normal text-slate-450">Ingests local CRM, billing transaction sequences, and device event telemetry.</p>
                        </button>

                        <button 
                          onClick={() => setSelectedFuncBlock("engine")}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            selectedFuncBlock === "engine" 
                              ? "bg-purple-600/10 border-purple-500 text-purple-300" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350"
                          }`}
                        >
                          <Cpu className="w-5 h-5 text-purple-500 mb-1" />
                          <h5 className="text-[10px] font-bold uppercase">2. Feature Engine</h5>
                          <p className="text-[8.5px] mt-1 leading-normal text-slate-450">Calculates SIM swap counts, device network sizes, and tenure ratios statefully.</p>
                        </button>

                        <button 
                          onClick={() => setSelectedFuncBlock("privacy")}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            selectedFuncBlock === "privacy" 
                              ? "bg-red-600/10 border-red-500 text-red-300" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350"
                          }`}
                        >
                          <Shield className="w-5 h-5 text-red-500 mb-1" />
                          <h5 className="text-[10px] font-bold uppercase">3. Privacy Shield</h5>
                          <p className="text-[8.5px] mt-1 leading-normal text-slate-450">Cryptographically hashes MSISDN/IMEI. Enforces Zero-PII contract boundaries.</p>
                        </button>

                        <button 
                          onClick={() => setSelectedFuncBlock("gateway")}
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            selectedFuncBlock === "gateway" 
                              ? "bg-emerald-600/10 border-emerald-500 text-emerald-300" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350"
                          }`}
                        >
                          <Share2 className="w-5 h-5 text-emerald-500 mb-1" />
                          <h5 className="text-[10px] font-bold uppercase">4. Federation Gate</h5>
                          <p className="text-[8.5px] mt-1 leading-normal text-slate-450">Exposes pre-computed conformed features. Zero raw data shared.</p>
                        </button>
                      </div>

                      {/* Detail card of selected block */}
                      <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-xs text-slate-300">
                        {selectedFuncBlock === "ingress" && (
                          <div>
                            <span className="text-blue-400 font-bold block mb-1">Functional Module: Data Ingress (Local Database Connections)</span>
                            Ingests transaction metadata directly from local relational databases, network cell tower logs, and billing files. Standard connectors pull logs from internal network feeds without forwarding records outside the carrier boundaries. 
                            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                              <span>✓ Isolation: Absolute</span>
                              <span>• Ingress SLA: &lt; 2 minutes</span>
                              <span>• CDC Tracking: Enabled</span>
                            </div>
                          </div>
                        )}
                        {selectedFuncBlock === "engine" && (
                          <div>
                            <span className="text-purple-400 font-bold block mb-1">Functional Module: Stateful Feature Engine</span>
                            Builds rolling time-window feature variables. For example, counting SIM card swap requests in the last 2 hours, tracking billing address consistency scores, and computing hardware change frequency indices. These are calculated locally to verify device integrity in real-time.
                            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                              <span>✓ Memory Engine: Redis/RocksDB</span>
                              <span>• Processing Latency: &lt; 10ms</span>
                            </div>
                          </div>
                        )}
                        {selectedFuncBlock === "privacy" && (
                          <div>
                            <span className="text-red-400 font-bold block mb-1">Functional Module: Privacy Shield & Data Contracts</span>
                            Encrypts or hashes identity attributes into secure cryptographic IDs. Strips plain-text subscriber names, exact IP values, street addresses, and social identifiers. It validates feature output payloads against data contracts to ensure no raw PII ever escapes.
                            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                              <span>✓ Masking: Cryptographic Hashing</span>
                              <span>• Compliance: GDPR, PIPEDA, HIPAA</span>
                            </div>
                          </div>
                        )}
                        {selectedFuncBlock === "gateway" && (
                          <div>
                            <span className="text-emerald-400 font-bold block mb-1">Functional Module: Federation Gateway Egress</span>
                            Signs and packs conformed, anonymized feature arrays. It opens a secure TLS socket tunnel with the central EnStream Platform, publishing trust signals (e.g., SIM_SWAP_COUNT_2H = 0, TENURE_DAYS = 2920) upon request or event triggers.
                            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                              <span>✓ Encryption: JWE Envelope</span>
                              <span>• Port: 443/8443</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TECHNICAL STACK SPEC SUB-TAB */}
                {nodeSubTab === "technical" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5">
                      <h4 className="text-xs uppercase font-mono text-blue-400 font-black mb-3">Trust Node Technical Architecture & Stack</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10.5px] font-mono text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500">
                              <th className="pb-2">Architectural Layer</th>
                              <th className="pb-2">Technology Used</th>
                              <th className="pb-2">Technical Rationale & Capability</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/80 text-slate-350">
                            <tr>
                              <td className="py-2.5 font-bold text-slate-200">Local Streaming Bus</td>
                              <td className="py-2.5 text-blue-400">Apache Kafka Streams</td>
                              <td className="py-2.5 text-slate-400">Ensures continuous low-latency ingestion of CRM and cell tower event feeds.</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-bold text-slate-200">State Store Database</td>
                              <td className="py-2.5 text-purple-400">Embedded RocksDB</td>
                              <td className="py-2.5 text-slate-400">Serves in-memory rolling time-window feature calculations with sub-millisecond writes.</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-bold text-slate-200">Local Cold Storage</td>
                              <td className="py-2.5 text-amber-400">Apache Iceberg / S3</td>
                              <td className="py-2.5 text-slate-400">Allows offline models training on conformed historical metadata without database lock-in.</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-bold text-slate-200">Cryptographic Signing</td>
                              <td className="py-2.5 text-red-400">JOSE JWE (RFC 7516)</td>
                              <td className="py-2.5 text-slate-400">Envelopes output features in an encrypted container signed by the node's private key.</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-bold text-slate-200">Network Transport</td>
                              <td className="py-2.5 text-emerald-400">gRPC over mTLS 1.3</td>
                              <td className="py-2.5 text-slate-400">Mutual SSL certificate validation secures connection directly to the central clearinghouse.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* CENTRAL PLATFORM INTERACTION SUB-TAB */}
                {nodeSubTab === "interaction" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                      <h4 className="text-xs uppercase font-mono text-blue-400 font-black">Node & Central Intelligence Interaction Protocol</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <h5 className="text-[11px] font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center">
                            <Share2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            <span>1. Data Plane: Real-Time Signal Exchange</span>
                          </h5>
                          <ul className="space-y-1.5 text-[10px] text-slate-400 leading-relaxed font-mono">
                            <li>• Bank initiates credit query to central EnStream platform.</li>
                            <li>• Central router queries Rogers, Bell, and Telus nodes simultaneously.</li>
                            <li>• Nodes lookup computed features (SIM Swap, Tenure) in local memory.</li>
                            <li>• Nodes encrypt payload using gRPC/JWE, returning anonymous values.</li>
                            <li>• Central platform aggregates signals, generates score, caches in Redis.</li>
                          </ul>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <h5 className="text-[11px] font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center">
                            <Settings className="w-3.5 h-3.5 mr-1 text-blue-400" />
                            <span>2. Control Plane: Orchestration & Policy</span>
                          </h5>
                          <ul className="space-y-1.5 text-[10px] text-slate-400 leading-relaxed font-mono">
                            <li>• Central system monitors node heartbeats and active latencies.</li>
                            <li>• Control plane pushes updated ML model weights and scoring rules.</li>
                            <li>• Pushes updated JSON schema data contract files to nodes.</li>
                            <li>• Configures logging parameters and logs compliance checks.</li>
                            <li>• Initiates automated local node reconciliation during gaps.</li>
                          </ul>
                        </div>

                      </div>

                      {/* Visual Flow diagram */}
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row items-center justify-between text-[9px] font-mono gap-4 text-slate-400">
                        <div className="text-center bg-slate-950 p-2.5 rounded border border-slate-800 w-full md:w-auto">
                          <span className="text-slate-500 block mb-0.5">LOCAL PROVIDER</span>
                          <span className="text-slate-200 font-bold">EnStream Trust Node</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
                        <div className="text-center px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded text-blue-400 font-bold">
                          gRPC Signal Tunnel (JWE Encrypted Payload)
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
                        <div className="text-center bg-slate-950 p-2.5 rounded border border-slate-800 w-full md:w-auto">
                          <span className="text-slate-500 block mb-0.5">ENSTREAM CENTRAL</span>
                          <span className="text-slate-200 font-bold">Federation & Scoring Engine</span>
                        </div>
                      </div>
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
