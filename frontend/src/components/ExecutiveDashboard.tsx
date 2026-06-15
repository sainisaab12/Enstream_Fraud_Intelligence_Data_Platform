import React, { useState } from "react";
import { 
  ShieldAlert, ShieldCheck, Activity, Database, Cpu, 
  Phone, AlertTriangle, Play, CheckCircle, HelpCircle, ArrowRight, Sparkles, Loader
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from "recharts";

interface ExecutiveDashboardProps {
  stateData: any;
  onSelectMsisdn: (msisdn: string) => void;
  onSimulateEvent?: (eventData: any) => void;
}

export default function ExecutiveDashboard({ stateData, onSelectMsisdn, onSimulateEvent }: ExecutiveDashboardProps) {
  const stats = stateData?.medallion_stats || {};
  const highRisk = stateData?.high_risk_entities || [];
  const model = stateData?.model_registry || {};

  // Interactive tour states
  const [selectedScenario, setSelectedScenario] = useState<string>("sim_swap");
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const scenarios: Record<string, {
    title: string;
    description: string;
    targetMsisdn: string;
    badge: string;
    badgeColor: string;
    payload: any;
    steps: { name: string; desc: string; detail: string }[];
  }> = {
    bell_activation: {
      title: "Legit SIM Activation",
      description: "A customer activates a new SIM card. System registers the profile, setting baseline scores.",
      targetMsisdn: "14165550200",
      badge: "BELL MOBILITY API",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      payload: {
        source: "bell",
        event_type: "activation",
        msisdn: "14165550200",
        imei: "35890104772120"
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "Bell publishes activation event", 
          detail: "Bell Mobility API publishes a new SIM card activation event. The event triggers E.164 verification." 
        },
        { 
          name: "Bronze S3", 
          desc: "Raw logs committed to Bronze S3", 
          detail: "Raw event payload committed to 'enstream.bronze' parquet files. Metadata manifests log the new write." 
        },
        { 
          name: "Silver SLA", 
          desc: "Passed schema validation checks", 
          detail: "Validation verifies telephone format and 15-digit IMEI. Cleaned payload saved to 'enstream.silver'." 
        },
        { 
          name: "Feature Store", 
          desc: "Dirty flag triggers calculations", 
          detail: "MSISDN marked as dirty. Scheduler computes baseline statistics: baseline age set to 0 days." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record initialized at 100", 
          detail: "Gold profile committed. Scoring rules detect normal activation: Trust Score initialized at 100. Status: Low Risk." 
        }
      ]
    },
    sim_swap: {
      title: "SIM-Swap Fraud Attack",
      description: "An attacker performs a SIM swap on Rogers network to capture verification codes.",
      targetMsisdn: "14165559001",
      badge: "ROGERS WIRELESS API",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      payload: {
        source: "rogers",
        event_type: "device_update",
        msisdn: "14165559001",
        imei: "3589010477" + (1000 + (stats.bronze_rows || 0))
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "Rogers API publishes device swap", 
          detail: "Rogers Gateway reports new IMEI connection for target. Attacker is trying to hijack SMS verification codes." 
        },
        { 
          name: "Bronze S3", 
          desc: "Raw parquet committed to S3", 
          detail: "Raw event payload written into 'enstream.bronze' parquet files. Iceberg version-hint manifest is updated." 
        },
        { 
          name: "Silver SLA", 
          desc: "Data quality & format verification", 
          detail: "Data Quality Engine validates MSISDN and IMEI parameters. Structure validated, promoted to 'enstream.silver'." 
        },
        { 
          name: "Feature Store", 
          desc: "Dirty flag triggers graph updates", 
          detail: "Entity marked as dirty. BFS graph traversal detects device churn count incremented to 3 within 24 hours." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record score drops to 45", 
          detail: "Aggregate updated in Redshift. Scoring engine subtracts 30 points for SIM swap velocity. Tier: High Risk." 
        }
      ]
    },
    device_ring: {
      title: "Organized Fraud Syndicate",
      description: "Multiple phone numbers share the exact same physical device IMEI, indicating a fraud mule ring.",
      targetMsisdn: "14165559013",
      badge: "TELUS CARRIER API",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      payload: {
        source: "telus",
        event_type: "activation",
        msisdn: "14165559013",
        imei: "35991104111222"
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "Telus reports new activation", 
          detail: "Telus reports phone activation on IMEI 35991104111222 (already shared by two other suspicious profiles)." 
        },
        { 
          name: "Bronze S3", 
          desc: "Raw event committed to Bronze", 
          detail: "Raw event written to parquet. Ingestion status counts increment." 
        },
        { 
          name: "Silver SLA", 
          desc: "Normalizes carrier and device numbers", 
          detail: "Passed schema check. Normalized payload written to silver database." 
        },
        { 
          name: "Feature Store", 
          desc: "Graph BFS maps shared devices", 
          detail: "Dirty flag triggers graph check. BFS walk detects 3 distinct subscribers sharing this single device." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record score drops to 15", 
          detail: "Gold profile updated. Rules engine subtracts 50 points for fraud ring syndicate involvement. Tier: Critical." 
        }
      ]
    },
    porting_flow: {
      title: "Inter-Carrier Porting",
      description: "A customer performs a porting request. System verifies low suspicion and logs history.",
      targetMsisdn: "14165550105",
      badge: "TRANSUNION PORTPS",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      payload: {
        source: "transunion",
        event_type: "porting",
        msisdn: "14165550105",
        source_carrier: "telus",
        target_carrier: "bell"
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "TransUnion reports port request", 
          detail: "TransUnion PortPS API reports request to move number from Telus to Bell Mobility." 
        },
        { 
          name: "Bronze S3", 
          desc: "Port event log committed to Bronze", 
          detail: "Raw port event details written to Bronze parquet storage." 
        },
        { 
          name: "Silver SLA", 
          desc: "Silver parses & cleans carrier names", 
          detail: "Standardized target carrier to 'bell'. Validation checks pass." 
        },
        { 
          name: "Feature Store", 
          desc: "Feature store updates carrier history", 
          detail: "Dirty flag recalculates. Porting frequency in 30 days is 1 (normal behavior)." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record remains safe at 98", 
          detail: "Gold profile updated. Trust Score remains High (98). User flagged as Low Risk." 
        }
      ]
    },
    mysql_cdc: {
      title: "CRM Profile Update",
      description: "Change Data Capture (CDC) maps subscriber database updates, maintaining profile synchronization.",
      targetMsisdn: "14165550110",
      badge: "MYSQL CDC BINLOG",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      payload: {
        source: "mysql",
        event_type: "customer_update",
        msisdn: "14165550110",
        customer_name: "Sarah Connor"
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "MySQL CDC captures name change", 
          detail: "MySQL CDC connector reads binary logs. Capture Agent publishes update indicating client name is now 'Sarah Connor'." 
        },
        { 
          name: "Bronze S3", 
          desc: "CDC updates written to Bronze S3", 
          detail: "Change log written to enstream.bronze parquet storage. Snapshots version logs update." 
        },
        { 
          name: "Silver SLA", 
          desc: "Silver parses and validates name", 
          detail: "Silver normalization validates string character lengths. Checks completeness. Promoted to Silver." 
        },
        { 
          name: "Feature Store", 
          desc: "Dirty flag updates feature details", 
          detail: "Scheduler maps dirty flag. updates customer name field to 'Sarah Connor' inside feature database." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record profile name synced", 
          detail: "Redshift Gold record name updated to 'Sarah Connor'. Trust score remains safe at 95. In-sync." 
        }
      ]
    },
    blacklist: {
      title: "Cross-Sector Blacklist Match",
      description: "A banking exchange report matches this subscriber MSISDN, immediately flagging fraud.",
      targetMsisdn: "14165559002",
      badge: "SFTP BLACKLISTS",
      badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/25",
      payload: {
        source: "sftp",
        event_type: "fraud_exchange_hit",
        msisdn: "14165559002",
        reason: "identity_theft"
      },
      steps: [
        { 
          name: "Ingress", 
          desc: "SFTP receives fraud report file", 
          detail: "TD Bank uploads blacklist marking the target MSISDN for active identity theft." 
        },
        { 
          name: "Bronze S3", 
          desc: "Blacklist logs written to Bronze S3", 
          detail: "Raw record committed. Metadata catalog manifests updated." 
        },
        { 
          name: "Silver SLA", 
          desc: "Silver formats & checks pass", 
          detail: "Validation verifies identity theft reasons. Promoted to Silver." 
        },
        { 
          name: "Feature Store", 
          desc: "Feature store increments hits count", 
          detail: "Dirty flag recalculates metrics. Blacklist matches counter increments to 1." 
        },
        { 
          name: "Gold OLAP", 
          desc: "Gold record score drops to 40", 
          detail: "Redshift updated. Scoring engine subtracts 60 points. Suspect flagged as High Risk." 
        }
      ]
    }
  };

  const handleRunSimulation = () => {
    if (!onSimulateEvent) return;
    setIsRunning(true);
    setCurrentStep(0);
    
    // Publish simulated event
    const active = scenarios[selectedScenario];
    onSimulateEvent(active.payload);

    // Run pipeline animation steps
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      if (stepCount < 5) {
        setCurrentStep(stepCount);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 900);
  };

  // Mock score distribution for chart
  const scoreDist = [
    { name: "0-20 (Critical)", count: highRisk.filter((x: any) => x.trust_score <= 20).length + 2, color: "#f43f5e" },
    { name: "21-50 (High)", count: highRisk.filter((x: any) => x.trust_score > 20 && x.trust_score <= 50).length + 4, color: "#f97316" },
    { name: "51-80 (Medium)", count: 18, color: "#eab308" },
    { name: "81-100 (Low)", count: 35, color: "#10b981" }
  ];

  const IngestionTimeline = [
    { time: "10:00", volume: 140 },
    { time: "11:00", volume: 220 },
    { time: "12:00", volume: 180 },
    { time: "13:00", volume: 290 },
    { time: "14:00", volume: 380 },
    { time: "15:00", volume: stats.bronze_rows || 210 }
  ];

  const activeScenarioInfo = scenarios[selectedScenario];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* SOLUTION NARRATIVE WALKTHROUGH PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                EnStream Solution Narrative Walkthrough
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Trace how events from all 6 major ingestion sources map across Medallion zones in real-time.
            </p>
          </div>
          <div className="mt-3 md:mt-0 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-500 font-mono">
            Clearance Level: <span className="text-blue-400">OPERATIONAL AUDIT</span>
          </div>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {Object.entries(scenarios).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                if (!isRunning) {
                  setSelectedScenario(key);
                  setCurrentStep(-1);
                }
              }}
              disabled={isRunning}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                selectedScenario === key
                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold"
                  : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400"
              } disabled:opacity-50`}
            >
              <span className="block font-bold truncate">{item.title}</span>
              <span className="block text-[9px] text-slate-500 font-normal mt-1 truncate">{item.targetMsisdn}</span>
            </button>
          ))}
        </div>

        {/* Split Scenario narrative description and flowchart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60 p-5 rounded-lg border border-slate-855">
          
          {/* Left Column: Business Story */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${activeScenarioInfo.badgeColor}`}>
                {activeScenarioInfo.badge}
              </span>
              <h4 className="text-sm font-extrabold text-slate-200 mt-2">{activeScenarioInfo.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{activeScenarioInfo.description}</p>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Telemetry details</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500">MSISDN:</span>
                  <span className="block text-slate-300 font-bold">{activeScenarioInfo.targetMsisdn}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ingest Channel:</span>
                  <span className="block text-slate-300 font-bold capitalize">{activeScenarioInfo.payload.source}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/20 text-slate-100 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-950/40"
              >
                {isRunning ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Live Pipeline</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => onSelectMsisdn(activeScenarioInfo.targetMsisdn)}
                disabled={isRunning}
                className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Investigate Entity</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ingress -> Bronze -> Silver -> Features -> Gold flowchart pipeline */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
              {activeScenarioInfo.steps.map((s, idx) => {
                const isCurrent = currentStep === idx;
                const isPassed = currentStep > idx;
                
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border transition-all duration-300 flex flex-col justify-between relative ${
                      isCurrent 
                        ? "bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/5" 
                        : isPassed 
                        ? "bg-slate-900/60 border-slate-800/80 opacity-90" 
                        : "bg-slate-900/10 border-slate-950 opacity-40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500">ZONE 0{idx+1}</span>
                      {isPassed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-fadeIn" />
                      ) : isCurrent ? (
                        <Loader className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      ) : null}
                    </div>
                    
                    <div className="mt-4">
                      <div className={`text-[10px] font-extrabold uppercase ${isCurrent ? "text-blue-400" : "text-slate-300"}`}>
                        {s.name}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 leading-snug">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Explanation text box */}
            <div className="p-3 bg-slate-900/85 border border-slate-850 rounded-lg min-h-[70px] flex items-center justify-center">
              {currentStep === -1 ? (
                <div className="text-center text-xs text-slate-500 flex items-center space-x-1.5 font-medium">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>Click 'Run Live Pipeline' to trace the event lifecycle and watch the automated checks execute.</span>
                </div>
              ) : (
                <div className="space-y-1 w-full animate-fadeIn">
                  <div className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-extrabold">
                    Step {currentStep + 1} processing details
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeScenarioInfo.steps[currentStep].detail}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Bronze Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg shadow-black/20 hover:border-blue-500/50 transition-all duration-300">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bronze Layer</p>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{stats.bronze_rows || 0} <span className="text-xs font-normal text-slate-500">rows</span></h3>
          </div>
        </div>

        {/* Silver Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg shadow-black/20 hover:border-emerald-500/50 transition-all duration-300">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Silver Layer</p>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{stats.silver_rows || 0} <span className="text-xs font-normal text-slate-500">clean</span></h3>
          </div>
        </div>

        {/* Gold Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg shadow-black/20 hover:border-amber-500/50 transition-all duration-300">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gold Redshift</p>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{stats.gold_rows || 0} <span className="text-xs font-normal text-slate-500">profiles</span></h3>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg shadow-black/20 hover:border-rose-500/50 transition-all duration-300">
          <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Alerts</p>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{highRisk.length} <span className="text-xs font-normal text-rose-500">suspects</span></h3>
          </div>
        </div>

        {/* Model Champion */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4 shadow-lg shadow-black/20 hover:border-purple-500/50 transition-all duration-300">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Model</p>
            <h3 className="text-md font-bold text-slate-100 mt-1">{model.champion_version || "v1.0.0"} <span className="text-xs font-normal text-purple-400">({model.models?.[model.champion_version]?.metrics?.auc || 0.88} AUC)</span></h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trust Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Trust Score Distribution</h3>
            <span className="text-xs text-slate-500">Dynamic Inference Cohorts</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  itemStyle={{ color: "#cbd5e1" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Ingestion Trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Ingestion Volume</h3>
            <span className="text-xs text-blue-400 flex items-center"><Activity className="w-3 h-3 mr-1 animate-pulse" /> Live Feed</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={IngestionTimeline}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Third Row: Fraud Ring & High-Risk Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Ring Visualization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Fraud Ring Network (Device Linkage)</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> SIM Swap Syndicate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">MSISDN nodes sharing the same target IMEI</p>
          </div>
          
          {/* Interactive SVG Network Graph */}
          <div className="h-64 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-center justify-center relative overflow-hidden my-4">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Connection lines */}
              <line x1="250" y1="120" x2="130" y2="60" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="250" y1="120" x2="250" y2="40" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="250" y1="120" x2="370" y2="60" stroke="#eab308" strokeWidth="2" />
              
              {/* Secondary links */}
              <line x1="130" y1="60" x2="60" y2="100" stroke="#475569" strokeWidth="1" />
              <line x1="370" y1="60" x2="440" y2="100" stroke="#475569" strokeWidth="1" />

              {/* Shared IMEI node (Center) */}
              <g className="cursor-pointer group">
                <circle cx="250" cy="120" r="16" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="2" className="animate-pulse" />
                <text x="250" y="145" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">IMEI: ...11222</text>
                <text x="250" y="123" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">💻</text>
              </g>

              {/* MSISDN Node 1 */}
              <g className="cursor-pointer group" onClick={() => onSelectMsisdn("14165559011")}>
                <circle cx="130" cy="60" r="14" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                <text x="130" y="82" fill="#ef4444" fontSize="9" textAnchor="middle">14165559011 (Crit)</text>
                <text x="130" y="63" fill="#cbd5e1" fontSize="9" textAnchor="middle">📞</text>
              </g>

              {/* MSISDN Node 2 */}
              <g className="cursor-pointer group" onClick={() => onSelectMsisdn("14165559012")}>
                <circle cx="250" cy="40" r="14" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                <text x="250" y="22" fill="#ef4444" fontSize="9" textAnchor="middle">14165559012 (Crit)</text>
                <text x="250" y="43" fill="#cbd5e1" fontSize="9" textAnchor="middle">📞</text>
              </g>

              {/* MSISDN Node 3 */}
              <g className="cursor-pointer group" onClick={() => onSelectMsisdn("14165559013")}>
                <circle cx="370" cy="60" r="14" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
                <text x="370" y="82" fill="#eab308" fontSize="9" textAnchor="middle">14165559013 (Med)</text>
                <text x="370" y="63" fill="#cbd5e1" fontSize="9" textAnchor="middle">📞</text>
              </g>

              {/* Unlinked IMEI Node */}
              <g className="cursor-pointer">
                <circle cx="60" cy="100" r="8" fill="#334155" />
                <text x="60" y="115" fill="#64748b" fontSize="8" textAnchor="middle">IMEI: ...88902</text>
              </g>

              {/* Another Unlinked node */}
              <g className="cursor-pointer">
                <circle cx="440" cy="100" r="8" fill="#334155" />
                <text x="440" y="115" fill="#64748b" fontSize="8" textAnchor="middle">IMEI: ...00391</text>
              </g>
            </svg>
            <div className="absolute bottom-2 left-2 text-[10px] text-slate-500">
              * Click node to inspect entity
            </div>
          </div>
        </div>

        {/* High-Risk Alerts Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">High-Risk Suspicion Feed</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time alerts from scoring engine</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px]">
            {highRisk.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No high-risk threats detected.
              </div>
            ) : (
              highRisk.map((entity: any, index: number) => (
                <div 
                  key={index} 
                  onClick={() => onSelectMsisdn(entity.msisdn)}
                  className="p-3 bg-slate-950/50 border border-slate-800 hover:border-slate-600 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      entity.trust_score <= 20 ? "bg-rose-500/10 text-rose-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" />
                        {entity.msisdn}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">
                        {entity.reason_codes?.join(", ") || "Multiple risk markers"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      entity.trust_score <= 20 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    }`}>
                      {entity.trust_score}
                    </span>
                    <div className="text-[9px] text-slate-500 mt-1 font-mono uppercase">
                      {entity.suspicion_tier}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-800">
            Showing top {highRisk.length} active alerts
          </div>
        </div>
      </div>

    </div>
  );
}
