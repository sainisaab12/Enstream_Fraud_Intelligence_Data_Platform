import React, { useState, useEffect } from "react";
import { 
  Search, Phone, User, Calendar, RefreshCw, AlertTriangle, 
  Share2, Clock, Smartphone, Layers, ShieldAlert, Cpu, Heart, CheckCircle2,
  List, Database, Landmark, AlertCircle
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from "recharts";

interface FraudInvestigationConsoleProps {
  entityDetails: any;
  searchMsisdn: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRescore: (msisdn: string) => void;
  rescoreLoading: boolean;
  onQueryMsisdn: (msisdn: string) => void;
}

export default function FraudInvestigationConsole({
  entityDetails,
  searchMsisdn,
  onSearchChange,
  onSearchSubmit,
  onRescore,
  rescoreLoading,
  onQueryMsisdn
}: FraudInvestigationConsoleProps) {
  
  const score = entityDetails?.score || {};
  const feats = entityDetails?.features || {};
  const silver = entityDetails?.silver_events || [];
  const msisdn = entityDetails?.msisdn;

  const [selectedSnapshot, setSelectedSnapshot] = useState<number>(3);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Live data store list state
  const [liveProfiles, setLiveProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState<boolean>(false);

  // Fetch live Gold layer profiles from the database on mount/refresh
  const fetchLiveProfiles = async () => {
    setProfilesLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/data/gold?limit=25");
      if (res.ok) {
        const data = await res.json();
        setLiveProfiles(data);
      }
    } catch (err) {
      console.error("Failed to load active profiles catalog", err);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveProfiles();
  }, [feats.last_update_time]); // Refresh list if a profile update/rescore occurs

  const shapData = Object.entries(score.explainability || {}).map(([key, val]: [string, any]) => ({
    feature: key.replace("_days", "").replace("_30d", "").replace("_count", "").replace("network_", "").replace("activation_", ""),
    val: val
  }));

  const getRiskColor = (scoreVal: number) => {
    if (scoreVal >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (scoreVal >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    if (scoreVal >= 20) return "text-orange-450 border-orange-500/20 bg-orange-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  const getRiskLabel = (scoreVal: number) => {
    if (scoreVal >= 80) return "Low Risk (Trusted)";
    if (scoreVal >= 50) return "Medium Risk";
    if (scoreVal >= 20) return "High Risk (Suspicious)";
    return "Critical Risk (Fraud Syndicate)";
  };

  // Resolve geography & hardware models
  const resolveAreaCode = (num: string) => {
    if (!num) return "Unknown Region";
    if (num.startsWith("1416") || num.startsWith("416")) return "Toronto, ON (Canada)";
    if (num.startsWith("1604") || num.startsWith("604")) return "Vancouver, BC (Canada)";
    if (num.startsWith("1514") || num.startsWith("514")) return "Montreal, QC (Canada)";
    return "Canada National Routing";
  };

  const resolveDeviceModel = (imeiStr: string) => {
    if (!imeiStr) return "Unknown Device Hardware";
    if (imeiStr.startsWith("35891")) return "Apple iPhone 15 Pro Max";
    if (imeiStr.startsWith("35722")) return "Samsung Galaxy S24 Ultra";
    if (imeiStr.startsWith("86022")) return "Google Pixel 8 Pro";
    return "Generic 5G Handset";
  };

  // Hardcoded Testing Scenario Presets
  const testingPresets = [
    { msisdn: "14165559001", label: "Rogers SIM Swapper", desc: "Frequent swaps on blacklisted hardware", color: "border-rose-500/30 text-rose-400 hover:bg-rose-500/5" },
    { msisdn: "14165559013", label: "Telus Fraud Ring Node", desc: "Links to multi-account device rings", color: "border-purple-500/30 text-purple-400 hover:bg-purple-500/5" },
    { msisdn: "14165559002", label: "SFTP Blacklist Match", desc: "Listed in shared exchange database", color: "border-amber-500/30 text-amber-400 hover:bg-amber-500/5" },
    { msisdn: "14165550110", label: "MySQL CRM (Sarah Connor)", desc: "CDC database customer sync profile", color: "border-blue-500/30 text-blue-400 hover:bg-blue-500/5" },
    { msisdn: "14165550105", label: "TU Legit Porting", desc: "Normal activation & port records", color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5" }
  ];

  const timeTravelSnapshots = [
    { version: 1, type: "activation", time: "30 days ago", score: 100, comment: "Initial Activation (Bell Canada)", details: "Pristine scoring profile. Zero device links." },
    { version: 2, type: "porting", time: "4 days ago", score: 85, comment: "Carrier Port Rogers ➔ Telus", details: "Deduction: HIGH_PORTING_FREQUENCY (-15 pts)." },
    { version: 3, type: "device_update", time: "1 hour ago", score: score.trust_score || 50, comment: "SIM swap detected on blacklist IMEI", details: `Deduction: DEVICE_SIM_SWAP_CHURN & BLACKLIST_HIT (${score.trust_score || 50} pts).` }
  ];

  // Render the quick-select targets column
  const renderSelectorsSidebar = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-5 flex flex-col h-full min-h-[500px]">
      
      {/* Scenario Presets list */}
      <div className="space-y-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex justify-between items-center">
          <span>System testing presets</span>
          <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
        </div>
        
        <div className="space-y-2">
          {testingPresets.map((preset) => (
            <button
              key={preset.msisdn}
              onClick={() => onQueryMsisdn(preset.msisdn)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col space-y-1 bg-slate-950/65 ${preset.color}`}
            >
              <div className="flex justify-between items-center w-full font-bold">
                <span>{preset.label}</span>
                <span className="font-mono font-medium">{preset.msisdn}</span>
              </div>
              <p className="text-[9.5px] text-slate-400 font-sans">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live catalog profiles list */}
      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800 pb-2 flex justify-between items-center shrink-0">
          <span>Lakehouse Gold profiles</span>
          <button 
            onClick={fetchLiveProfiles} 
            disabled={profilesLoading} 
            className="hover:text-blue-400 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${profilesLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-2 flex-1 scrollbar-thin">
          {profilesLoading && liveProfiles.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : liveProfiles.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-slate-500 font-sans italic">
              No live warehouse entries. Use Event Ingress tab to load data.
            </div>
          ) : (
            liveProfiles.map((p) => {
              const isSelected = msisdn === p.msisdn;
              return (
                <div
                  key={p.msisdn}
                  onClick={() => onQueryMsisdn(p.msisdn)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? "bg-blue-500/10 border-blue-500 text-blue-400 font-bold" 
                      : "bg-slate-950/45 border-slate-850 text-slate-300 hover:border-slate-800"
                  }`}
                >
                  <div className="space-y-0.5 text-left">
                    <span className="block font-bold text-[10px] font-mono">{p.msisdn}</span>
                    <span className="block text-[9px] text-slate-400 font-sans truncate max-w-[130px]" title={p.customer_name}>
                      {p.customer_name || "Unknown Name"}
                    </span>
                  </div>

                  <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
                    {p.carrier || "unknown"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="space-y-1 w-full md:w-auto">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Phone className="w-4 h-4 mr-2 text-blue-400 animate-pulse" />
              Fraud Operator Query Panel
            </h3>
            <p className="text-xs text-slate-400">
              Query customer MSISDN, retrieve Online Feature Store profile and explainable Trust Scores.
            </p>
          </div>

          <div className="flex w-full md:w-auto space-x-3 items-center">
            <div className="relative flex-1 md:w-72">
              <input 
                type="text" 
                placeholder="Search MSISDN (e.g. 14165559001)..."
                value={searchMsisdn}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs rounded-lg pl-9 pr-4 py-2.5 outline-none font-mono text-slate-100"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <button 
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-100 font-bold text-xs rounded-lg flex items-center space-x-2 transition-all shadow-md shadow-blue-900/30"
            >
              <span>Query Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Investigation Details */}
        <div className="xl:col-span-3 space-y-6">
          {msisdn ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Trust Score Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Score Result</h3>
                    {score.dirty_flag && (
                      <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded text-[8px] font-bold text-rose-400 animate-pulse">
                        Entity Dirty
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-3">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="none" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          stroke={score.trust_score >= 80 ? "#10b981" : score.trust_score >= 50 ? "#eab308" : score.trust_score >= 20 ? "#f97316" : "#ef4444"} 
                          strokeWidth="8" 
                          fill="none" 
                          strokeDasharray={`${2.64 * (score.trust_score || 0)} 264`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <text x="50" y="56" fill="#cbd5e1" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          {score.trust_score}
                        </text>
                      </svg>
                    </div>

                    <div className="text-center">
                      <h4 className={`text-md font-bold ${getRiskColor(score.trust_score).split(" ")[0]}`}>
                        {getRiskLabel(score.trust_score)}
                      </h4>
                      <span className="text-[10px] text-slate-505 uppercase font-mono">Suspicion Tier</span>
                    </div>
                  </div>

                  {/* Reason codes list */}
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[9px] font-bold text-slate-505 uppercase">Triggered Reason Codes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {score.reason_codes && score.reason_codes.length > 0 ? (
                        score.reason_codes.map((code: string, idx: number) => (
                          <span 
                            key={idx}
                            className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${
                              score.trust_score >= 80 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {code}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-450 font-bold text-[10px] font-sans flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Profile clear: Zero violations
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Manual Rescore */}
                  <div className="pt-2">
                    <button 
                      onClick={() => onRescore(msisdn)}
                      disabled={rescoreLoading}
                      className="w-full py-2 bg-slate-955 border border-slate-800 hover:border-slate-600 rounded-lg text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${rescoreLoading ? "animate-spin" : ""}`} />
                      <span>{rescoreLoading ? "Recalculating..." : "Force Rescore"}</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: SHAP Explainability Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 lg:col-span-2">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">SHAP Feature Contributions</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Model Version: {score.model_version}</span>
                  </div>

                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shapData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                        <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={9} width={90} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                        />
                        <ReferenceLine x={0} stroke="#475569" />
                        <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                          {shapData.map((entry: any, index: number) => {
                            let fill = entry.val > 0 ? "#10b981" : "#ef4444";
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/60 pt-3">
                    Green values increase trust; Red values decrease trust
                  </div>
                </div>
              </div>

              {/* SECOND ROW: GRAPH NETWORK & SNAPS EXPLORER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: shared-device visualizer bipartite graph */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 lg:col-span-2 flex flex-col justify-between">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                      <Share2 className="w-4 h-4 mr-2 text-purple-400" />
                      Topological Risk Mapping: Shared Hardware Nodes (G = MSISDN + IMEI)
                    </h3>
                    <span className="text-[9.5px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono font-bold border border-purple-500/20">
                      Ring Size: {feats.network_fraud_ring_size || 1}
                    </span>
                  </div>

                  {/* Bipartite Graph Node Visualizer */}
                  <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-4 h-64 relative overflow-hidden flex items-center justify-center">
                    
                    {/* Visual relationship connections (Lines) */}
                    {feats.network_fraud_ring_size > 0 ? (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#f43f5e" strokeWidth="1.8" />
                        <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#d97706" strokeWidth="1.8" />
                      </svg>
                    ) : (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="35%" y1="50%" x2="65%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                      </svg>
                    )}

                    {/* Nodes layout */}
                    <div className="w-full flex items-center justify-between px-10 relative z-10">
                      
                      <div 
                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                          hoveredNode === "root" ? "scale-110" : ""
                        }`}
                        onMouseEnter={() => setHoveredNode("root")}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-slate-100 font-bold border-2 border-blue-400 shadow-lg shadow-blue-500/20">
                          <Phone className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-200 mt-2 font-bold">{msisdn}</span>
                        <span className="text-[9px] text-blue-400">Target</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-md">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-2 truncate max-w-[100px]" title={silver[0]?.imei || "No IMEI"}>
                          {silver[0]?.imei || "No Hardware"}
                        </span>
                        <span className="text-[8px] text-slate-505">Shared Device</span>
                      </div>

                      <div className="flex flex-col space-y-4">
                        {feats.network_fraud_ring_size > 0 ? (
                          <>
                            <div 
                              className="flex items-center space-x-2 bg-slate-900 border border-rose-955 p-1.5 rounded-lg shadow-md cursor-pointer hover:border-rose-500"
                              onClick={() => onQueryMsisdn("14165559012")}
                            >
                              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-455 flex items-center justify-center font-bold text-[9px]">
                                R1
                              </div>
                              <div className="text-left">
                                <span className="block text-[9.5px] font-mono text-slate-300">+14165559012</span>
                                <span className="block text-[8px] text-rose-500 uppercase font-mono font-bold">Score: 18</span>
                              </div>
                            </div>

                            <div 
                              className="flex items-center space-x-2 bg-slate-900 border border-amber-955 p-1.5 rounded-lg shadow-md cursor-pointer hover:border-amber-500"
                              onClick={() => onQueryMsisdn("14165559013")}
                            >
                              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px]">
                                R2
                              </div>
                              <div className="text-left">
                                <span className="block text-[9.5px] font-mono text-slate-300">+14165559013</span>
                                <span className="block text-[8px] text-amber-500 uppercase font-mono font-bold">Score: 35</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center p-4 bg-slate-900/50 rounded-lg border border-slate-850 text-[10px] text-emerald-450 font-sans font-bold">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                            <span>Hardware Profile Secure</span>
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-[8.5px] text-slate-500 font-mono">
                      <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Target</span>
                      <span className="flex items-center"><span className="w-2 h-2 rounded bg-slate-700 mr-1"></span>Device</span>
                      {feats.network_fraud_ring_size > 0 && (
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span>Linked accounts</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    <span className="text-purple-400 font-bold uppercase font-mono">Security Note:</span> Shared IMEI nodes represent telephone accounts activating on matching SIM cards or hardware slots. In fraud rings, syndicates swap multiple burner MSISDNs through standard devices.
                  </p>
                </div>

                {/* Column 2: Iceberg Snapshot time travel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-blue-400 animate-pulse" />
                      Apache Iceberg Time-Travel
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Historical snapshots committed in S3 parquet</p>
                  </div>

                  <div className="space-y-2.5 flex-1 py-1.5 overflow-y-auto max-h-[160px] pr-1">
                    {timeTravelSnapshots.map((snap) => (
                      <div 
                        key={snap.version}
                        onClick={() => setSelectedSnapshot(snap.version)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          selectedSnapshot === snap.version 
                            ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold" 
                            : "bg-slate-950 border-slate-850 text-slate-450 hover:border-slate-800"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold font-mono text-[10px]">
                            v{snap.version} - {snap.time}
                          </div>
                          <div className="text-[9.5px] font-sans text-slate-400 font-normal">
                            Commit: {snap.comment}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                          snap.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : snap.score >= 50 ? "bg-amber-500/10 text-amber-450" : "bg-rose-500/10 text-rose-455"
                        }`}>
                          Score: {snap.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-450 space-y-1.5 border-l-2 border-l-blue-500">
                    <div className="font-bold text-blue-400 uppercase tracking-wider text-[9px]">Snapshot Audit Spec:</div>
                    <p className="font-sans leading-relaxed">
                      {timeTravelSnapshots[selectedSnapshot - 1].details}
                    </p>
                  </div>
                </div>

              </div>

              {/* THIRD ROW: FEATURE PROFILE DETAILS & AUDIT TIMELINES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Feature Details & Area Resolution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-400" />
                      Online Feature Store Profile
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Customer Name:</span>
                      <span className="text-slate-200 font-bold">{feats.customer_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Carrier:</span>
                      <span className="text-slate-200 font-mono uppercase text-blue-400 font-bold">{feats.carrier}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Registered Area:</span>
                      <span className="text-slate-300 font-bold font-sans">{resolveAreaCode(msisdn)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Device Model (Tac):</span>
                      <span className="text-slate-300 font-sans font-bold">{resolveDeviceModel(silver[0]?.imei)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">MSISDN Age:</span>
                      <span className="text-slate-200 font-mono">{feats.msisdn_age_days} Days</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">30d Port Count:</span>
                      <span className="text-slate-255 font-mono font-bold text-amber-500">{feats.port_frequency_30d}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Device Churn (IMEI):</span>
                      <span className="text-slate-255 font-mono font-bold text-amber-500">{feats.device_churn_count}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-slate-550">Fraud exchange Matches:</span>
                      <span className="text-slate-200 font-mono">{feats.fraud_exchange_matches}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-550">Shared IMEI linkages:</span>
                      <span className={`font-mono font-bold ${feats.network_fraud_ring_size > 0 ? "text-rose-500" : "text-slate-350"}`}>
                        {feats.network_fraud_ring_size} (linked numbers)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Event Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      Silver Layer Audit Trail (Clean Transaction History)
                    </h3>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1">
                    {silver.length === 0 ? (
                      <div className="text-slate-500 text-xs italic text-center py-10">
                        No verified history found.
                      </div>
                    ) : (
                      [...silver].reverse().map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                            {idx !== silver.length - 1 && <div className="w-0.5 h-10 bg-slate-800 mt-1"></div>}
                          </div>
                          
                          <div className="flex-1 p-2 bg-slate-950/40 border border-slate-850 rounded-lg">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-mono uppercase font-bold text-blue-400 flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                {item.event_type}
                              </span>
                              <span className="text-slate-500 font-mono">
                                {new Date(item.timestamp * 1000).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-slate-300 font-mono text-[10px] mt-1 flex flex-wrap gap-x-4">
                              {item.imei && <span>IMEI: {item.imei}</span>}
                              {item.carrier && <span>Carrier: <span className="uppercase">{item.carrier}</span></span>}
                              <span>Status: <span className="text-emerald-400 font-bold">DQ_PASSED</span></span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 shadow-lg text-center text-slate-500 flex flex-col justify-center items-center h-full min-h-[400px]">
              <AlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-bold text-slate-400">No subscriber data selected</p>
              <p className="text-xs text-slate-550 mt-1">
                Select a profile or a scenario from the sidebar catalog to view explainability reports and trace topological rings.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Selectors Catalog (Active Profiles list) */}
        <div className="xl:col-span-1">
          {renderSelectorsSidebar()}
        </div>

      </div>
    </div>
  );
}
