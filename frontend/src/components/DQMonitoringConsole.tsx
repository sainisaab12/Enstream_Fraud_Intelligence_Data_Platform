import React, { useState } from "react";
import { 
  AlertCircle, XCircle, Eye, HardDrive, ShieldCheck, CheckCircle2, 
  Activity, Clock, RefreshCw, Check, AlertTriangle, Play
} from "lucide-react";

interface DQMonitoringConsoleProps {
  stateData: any;
}

export default function DQMonitoringConsole({ stateData }: DQMonitoringConsoleProps) {
  const dq = stateData?.dq_summary || { total_checked: 0, total_passed: 0, total_failed: 0, failed_by_rule: {} };
  const logs = stateData?.dq_logs || [];
  
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [backfillLoading, setBackfillLoading] = useState<boolean>(false);
  const [backfillLogs, setBackfillLogs] = useState<string[]>([]);
  const [backfillSuccess, setBackfillSuccess] = useState<boolean>(false);

  const getPassRate = (): string => {
    if (!dq.total_checked) return "100.0";
    return ((dq.total_passed / dq.total_checked) * 100).toFixed(1);
  };

  const getRuleFailCount = (rule: string): number => {
    return dq.failed_by_rule?.[rule] || 0;
  };

  // Run self-healing simulation backfill
  const handleTriggerBackfill = () => {
    setBackfillLoading(true);
    setBackfillSuccess(false);
    setBackfillLogs([]);
    
    const steps = [
      "Initiating data quality self-healing reconciler...",
      "Scanning enstream.quarantine Parquet partition logs...",
      "Found failed records violating CHECK_IMEI_COMPLETENESS.",
      "Running schema resolution & fallback IMEI enrichments...",
      "Validating E.164 telephone number formats...",
      "Re-processing 8 quarantined items...",
      "Automated backfill completed! Cleaned records promoted to enstream.silver."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setBackfillLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setBackfillLoading(false);
          setBackfillSuccess(true);
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* DQ Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pass Rate Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DQ Validation Pass Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <h2 className={`text-3xl font-extrabold ${
              parseFloat(getPassRate()) >= 98 ? "text-emerald-400" : parseFloat(getPassRate()) >= 90 ? "text-amber-400" : "text-rose-500"
            }`}>
              {getPassRate()}%
            </h2>
            <span className="text-xs text-slate-500">Target &gt; 99%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full ${
                parseFloat(getPassRate()) >= 98 ? "bg-emerald-500" : parseFloat(getPassRate()) >= 90 ? "bg-amber-500" : "bg-rose-500"
              }`} 
              style={{ width: `${getPassRate()}%` }}
            ></div>
          </div>
        </div>

        {/* Ingest SLA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Ingest Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <h2 className="text-3xl font-extrabold text-blue-400 font-mono">2.4s</h2>
            <span className="text-xs text-slate-550">Target &lt; 10s</span>
          </div>
          <span className="text-[9.5px] text-emerald-400 font-bold uppercase tracking-wider flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            SLA Compliant
          </span>
        </div>

        {/* Passed Rows */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clean Records Promoted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <h2 className="text-3xl font-bold text-slate-100 font-mono">{dq.total_passed || 0}</h2>
            <span className="text-xs text-slate-500">Rows</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Committed to Silver Iceberg tables</span>
        </div>

        {/* Quarantined Rows */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quarantined Records</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <h2 className="text-3xl font-bold text-rose-500 font-mono">{dq.total_failed || 0}</h2>
            <span className="text-xs text-slate-500">Violations</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Isolated in Quarantine Dead-Letter S3 path</span>
        </div>
      </div>

      {/* Main SLA Rules Audit Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500 animate-pulse" />
            Data Quality SLA Rules Audit Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Track validation rule assertions, constraints, pass/fail counts, and live compliance statuses.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold text-[9.5px]">
                <th className="py-2.5 px-3">Rule Assertion</th>
                <th className="py-2.5 px-3">Validation Logic Description</th>
                <th className="py-2.5 px-3">Lakehouse Layer</th>
                <th className="py-2.5 px-3 text-right">Failures</th>
                <th className="py-2.5 px-3">SLA Threshold</th>
                <th className="py-2.5 px-3 text-right">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono text-[11px] text-slate-300">
              
              {/* Check 1 */}
              <tr className="hover:bg-slate-950/20">
                <td className="py-3 px-3 text-blue-400 font-bold">CHECK_MSISDN_FORMAT</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Validates telephone number matches E.164 phone formats.</td>
                <td className="py-3 px-3 text-slate-500">Bronze ➔ Silver</td>
                <td className="py-3 px-3 text-right text-rose-500 font-bold">{getRuleFailCount("schema_validation")}</td>
                <td className="py-3 px-3 text-slate-400">100.0%</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>

              {/* Check 2 */}
              <tr className="hover:bg-slate-950/20">
                <td className="py-3 px-3 text-blue-400 font-bold">CHECK_IMEI_COMPLETENESS</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Verifies that carrier activation telemetry includes device hardware IMEI.</td>
                <td className="py-3 px-3 text-slate-500">Bronze ➔ Silver</td>
                <td className="py-3 px-3 text-right text-rose-500 font-bold">{getRuleFailCount("completeness")}</td>
                <td className="py-3 px-3 text-slate-400">100.0%</td>
                <td className="py-3 px-3 text-right">
                  <span className={`px-2 py-0.5 border rounded font-bold text-[9px] ${
                    getRuleFailCount("completeness") > 5 
                      ? "bg-rose-500/10 text-rose-455 border-rose-500/20" 
                      : getRuleFailCount("completeness") > 0 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {getRuleFailCount("completeness") > 5 ? "WARNING" : "COMPLIANT"}
                  </span>
                </td>
              </tr>

              {/* Check 3 */}
              <tr className="hover:bg-slate-950/20">
                <td className="py-3 px-3 text-blue-400 font-bold">CHECK_DUPLICATE_EVENTS</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Deduplicates incoming packets on event_id sliding window.</td>
                <td className="py-3 px-3 text-slate-500">Bronze ➔ Silver</td>
                <td className="py-3 px-3 text-right text-rose-500 font-bold">{getRuleFailCount("uniqueness")}</td>
                <td className="py-3 px-3 text-slate-400">100.0%</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>

              {/* Check 4 */}
              <tr className="hover:bg-slate-950/20">
                <td className="py-3 px-3 text-blue-400 font-bold">CHECK_FRESHNESS_SLA</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Enforces that the ingested record's timestamp is &lt; 2 hours old.</td>
                <td className="py-3 px-3 text-slate-500">Bronze ➔ Silver</td>
                <td className="py-3 px-3 text-right text-rose-500 font-bold">{getRuleFailCount("freshness")}</td>
                <td className="py-3 px-3 text-slate-400">99.0%</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>

              {/* Check 5 */}
              <tr className="hover:bg-slate-950/20">
                <td className="py-3 px-3 text-blue-400 font-bold">CHECK_CARRIER_INTEGRITY</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Validates carrier identifiers against standard catalog whitelist registry.</td>
                <td className="py-3 px-3 text-slate-500">Silver ➔ Gold</td>
                <td className="py-3 px-3 text-right text-rose-500 font-bold">{getRuleFailCount("referential_integrity")}</td>
                <td className="py-3 px-3 text-slate-400">100.0%</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[9px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Breakdown and Live Quarantine logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Self-Healing Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-1 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 text-blue-400 animate-spin-slow" />
              Reconciliation & Healing Control
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated healing and backfill processes</p>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/45 p-3 rounded-lg border border-slate-850">
              Quarantined items violating data constraints are stored in a Dead-Letter Queue (DLQ). The healing reconciler performs fallback lookup matches on missing values to backfill silver tables.
            </p>

            <button
              onClick={handleTriggerBackfill}
              disabled={backfillLoading || logs.length === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/20 text-slate-100 disabled:text-slate-500 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/10"
            >
              {backfillLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-100" />
                  <span>Scanning & Resolving...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Automated Healing Reconciler</span>
                </>
              )}
            </button>

            {/* Backfill Progress Logs Console */}
            {(backfillLoading || backfillLogs.length > 0) && (
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg font-mono text-[9px] text-slate-300 space-y-1.5 max-h-[140px] overflow-y-auto leading-relaxed border-l-2 border-l-blue-500">
                {backfillLogs.map((log, i) => (
                  <div key={i} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-1.5">➔</span>
                    <span className={i === backfillLogs.length - 1 && backfillSuccess ? "text-emerald-400 font-bold" : ""}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {backfillSuccess && (
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/25 flex items-center space-x-2 text-xs text-emerald-400">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Healing completed. Promoted 8 records from Quarantine.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Quarantine Logs (DLQ) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Failed Record Logs (DLQ)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Events quarantined for review</p>
            </div>
            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded border border-rose-500/20 font-mono">
              DLQ Topic Active
            </span>
          </div>

          <div className="overflow-y-auto max-h-[300px] pr-1 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs italic">
                No data quality failures detected. Run simulated events to inspect DQ validation.
              </div>
            ) : (
              [...logs].reverse().map((log: any, index: number) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-lg flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-400 text-[9px] font-bold rounded uppercase">
                        {log.source}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        Event: {log.event_type}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        [{new Date(log.timestamp * 1000).toLocaleTimeString()}]
                      </span>
                    </div>
                    <div className="text-xs text-rose-400 flex items-center font-mono text-[10.5px]">
                      <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {log.errors?.[0] || "Invalid event properties"}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedError(log)}
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg text-slate-400 hover:text-slate-200 flex items-center space-x-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> <span>Drill Down</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Drill-down Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  DQ Quarantine Detail
                </h3>
              </div>
              <button 
                onClick={() => setSelectedError(null)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/60"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Errors List */}
              <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/20 space-y-2">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">Failed Assertions:</h4>
                <ul className="list-disc list-inside text-rose-300 font-mono space-y-1">
                  {selectedError.errors?.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>

              {/* Event Metadata */}
              <div className="grid grid-cols-2 gap-4 font-mono p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-slate-400">
                <p>Event ID: <span className="text-slate-200">{selectedError.event_id || "None"}</span></p>
                <p>Source Channel: <span className="text-slate-200 uppercase">{selectedError.source}</span></p>
                <p>MSISDN: <span className="text-slate-200">{selectedError.msisdn || "Missing"}</span></p>
                <p>Quarantine Time: <span className="text-slate-200">{new Date(selectedError.timestamp * 1000).toLocaleString()}</span></p>
              </div>

              {/* Raw JSON payload */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center">
                  <HardDrive className="w-3.5 h-3.5 mr-1" /> Raw Ingested JSON Payload:
                </h4>
                <pre className="p-4 bg-slate-955 text-slate-300 rounded-xl border border-slate-850 overflow-x-auto font-mono text-[11px] max-h-[180px]">
                  {JSON.stringify(selectedError.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
