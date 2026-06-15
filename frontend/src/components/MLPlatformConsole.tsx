import React, { useState } from "react";
import { 
  Cpu, GitFork, AlertTriangle, 
  BarChart2, Play, CheckCircle, TrendingUp 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from "recharts";

interface MLPlatformConsoleProps {
  stateData: any;
  onPromoteModel: (version: string) => void;
  onRollbackModel: (version: string) => void;
  onTrainModel: () => void;
}

export default function MLPlatformConsole({ 
  stateData, 
  onPromoteModel, 
  onRollbackModel, 
  onTrainModel 
}: MLPlatformConsoleProps) {
  const modelRegistry = stateData?.model_registry || { models: {}, history: [] };
  const pipelineRuns = stateData?.pipeline_runs || [];
  const drift = stateData?.drift_metrics || { psi: 0.0, alerts: [], feature_drifts: {} };
  
  const [trainingLoading, setTrainingLoading] = useState(false);

  const handleTrainClick = () => {
    setTrainingLoading(true);
    onTrainModel();
    setTimeout(() => setTrainingLoading(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "champion": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "challenger": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-slate-800 text-slate-500 border-slate-700/60";
    }
  };

  const driftData = Object.entries(drift.feature_drifts || {}).map(([key, val]: [string, any]) => ({
    feature: key.replace("_days", "").replace("_30d", "").replace("_count", "").replace("network_", ""),
    drift: val
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ML registry and action controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model Registry List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-purple-400" />
              Model Registry & Deployments
            </h3>
            <button 
              onClick={handleTrainClick}
              disabled={trainingLoading}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-slate-100 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-purple-900/30"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{trainingLoading ? "Training..." : "Trigger Retraining"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Metrics (AUC / F1)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                {Object.values(modelRegistry.models || {}).map((m: any) => (
                  <tr key={m.version} className="hover:bg-slate-950/20">
                    <td className="py-3 px-4 text-slate-100 font-bold">{m.version}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{m.name}</td>
                    <td className="py-3 px-4 text-slate-200">
                      {m.metrics?.auc} AUC / {m.metrics?.f1} F1
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {m.status === "Challenger" && (
                        <button 
                          onClick={() => onPromoteModel(m.version)}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold"
                        >
                          Promote to Champ
                        </button>
                      )}
                      {m.status === "Retired" && (
                        <button 
                          onClick={() => onRollbackModel(m.version)}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-[10px] font-bold"
                        >
                          Rollback
                        </button>
                      )}
                      {m.status === "Champion" && (
                        <span className="text-[10px] text-slate-500 italic">Production Serving</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MLOps Pipeline Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <GitFork className="w-4 h-4 mr-2 text-blue-400" />
              MLOps Pipeline Runs
            </h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[200px]">
            {pipelineRuns.map((run: any) => (
              <div 
                key={run.run_id} 
                className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-300 font-mono">{run.run_id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      run.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400 animate-pulse"
                    }`}>
                      {run.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Duration: {run.duration}s | AUC: {run.metrics?.auc || "N/A"}
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 font-mono">
                  {run.artifacts?.[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drift Monitoring Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PSI Drift gauge and alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-amber-500" />
                Population Stability Index (PSI)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Detects scoring distribution deviations</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6">
              <h1 className={`text-4xl font-extrabold font-mono ${
                drift.psi >= 0.25 ? "text-rose-500" : drift.psi >= 0.1 ? "text-amber-500" : "text-emerald-400"
              }`}>
                {drift.psi}
              </h1>
              <span className="text-[10px] text-slate-500 uppercase mt-1">
                {drift.psi >= 0.25 ? "Critical Drift" : drift.psi >= 0.1 ? "Moderate Drift" : "Optimal (No Drift)"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {drift.alerts?.length === 0 ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs text-center flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Optimal Distribution Stability
              </div>
            ) : (
              drift.alerts.map((a: any, i: number) => (
                <div 
                  key={i} 
                  className={`p-3 border rounded-lg text-xs flex items-start space-x-2 ${
                    a.level === "CRITICAL" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{a.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Drift chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <BarChart2 className="w-4 h-4 mr-2 text-blue-400" />
              Feature-Level Drift Analysis (Wasserstein Metrics)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Compares online features vs baseline model training distribution</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driftData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 0.5]} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                />
                <ReferenceLine x={0.1} stroke="#eab308" strokeDasharray="3 3" label={{ value: "Warn", fill: "#eab308", fontSize: 8 }} />
                <ReferenceLine x={0.25} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Crit", fill: "#ef4444", fontSize: 8 }} />
                <Bar dataKey="drift" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {driftData.map((entry: any, index: number) => {
                    let c = "#10b981"; // green
                    if (entry.drift >= 0.25) c = "#ef4444"; // red
                    else if (entry.drift >= 0.1) c = "#f59e0b"; // yellow
                    return <Cell key={`cell-${index}`} fill={c} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
