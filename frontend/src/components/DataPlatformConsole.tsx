import { BACKEND_URL } from "../config";
import React, { useState, useEffect } from "react";
import { Database, ArrowRight, ShieldCheck, Cpu, HardDrive, Loader, Info, HelpCircle, FileText, CheckCircle, Layers } from "lucide-react";

interface DataPlatformConsoleProps {
  stateData: any;
  entityDetails: any;
  onRescore: (msisdn: string) => void;
}

export default function DataPlatformConsole({ stateData }: DataPlatformConsoleProps) {
  const [activeLayer, setActiveLayer] = useState<"bronze" | "silver" | "gold">("bronze");
  const [bronzeData, setBronzeData] = useState<any[]>([]);
  const [silverData, setSilverData] = useState<any[]>([]);
  const [goldData, setGoldData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const stats = stateData?.medallion_stats || {};

  const fetchData = async (layer: "bronze" | "silver" | "gold") => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/data/${layer}?limit=15`);
      if (res.ok) {
        const data = await res.json();
        if (layer === "bronze") setBronzeData(data);
        else if (layer === "silver") setSilverData(data);
        else if (layer === "gold") setGoldData(data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${layer} data`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeLayer);
  }, [activeLayer, stats.bronze_rows, stats.silver_rows, stats.gold_rows]);

  // Schema dictionary definitions
  const schemas = {
    bronze: [
      { name: "event_id", type: "string (UUID)", desc: "Unique transaction identifier generated at ingestion edge." },
      { name: "event_type", type: "string", desc: "Nature of transaction event (activation, porting, device_update)." },
      { name: "msisdn", type: "string", desc: "Normalized mobile subscriber telephone number." },
      { name: "payload", type: "string (JSON)", desc: "Raw stringified JSON block received from carrier webhook." },
      { name: "source", type: "string", desc: "Originating ingest provider channel (e.g. bell, sftp)." },
      { name: "ingested_at", type: "double (Epoch)", desc: "Epoch timestamp mapping transaction commit to Bronze." }
    ],
    silver: [
      { name: "event_id", type: "string (UUID)", desc: "Inherited from Bronze layer for audit trail mapping." },
      { name: "event_type", type: "string", desc: "Normalized event classification string." },
      { name: "msisdn", type: "string", desc: "Cleaned E.164 phone format identifier." },
      { name: "carrier", type: "string", desc: "Sanitized lowercase provider designation (e.g. telus)." },
      { name: "imei", type: "string", desc: "Cleaned 15-digit mobile device identification serial." },
      { name: "timestamp", type: "double (Epoch)", desc: "Occurrence timestamp of the event." },
      { name: "validated_at", type: "double (Epoch)", desc: "Timestamp when DQ checks were ran." },
      { name: "dq_passed", type: "boolean", desc: "True if schema/completeness assertions passed." },
      { name: "dq_errors", type: "string (JSON)", desc: "JSON array detailing failure flags (quarantine logs)." }
    ],
    gold: [
      { name: "msisdn", type: "string (PK)", desc: "E.164 phone number. Primary Key." },
      { name: "customer_name", type: "string", desc: "Standardized customer name synced via CDC binlogs." },
      { name: "carrier", type: "string", desc: "Operating provider network." },
      { name: "msisdn_age_days", type: "long", desc: "Days elapsed since initial activation." },
      { name: "port_frequency_30d", type: "long", desc: "Count of inter-carrier port requests in past 30 days." },
      { name: "activation_recency_hours", type: "double", desc: "Hours elapsed since last SIM activation." },
      { name: "device_churn_count", type: "long", desc: "Distinct device IMEIs associated with this MSISDN." },
      { name: "fraud_exchange_matches", type: "long", desc: "Occurrence count in SFTP blacklist exchange databases." },
      { name: "network_fraud_ring_size", type: "long", desc: "Count of shared device nodes in network graph component." },
      { name: "last_update_time", type: "double (Epoch)", desc: "Epoch timestamp of last OLAP aggregate compile." }
    ]
  };

  const formatTime = (epoch: any) => {
    if (!epoch) return "N/A";
    const d = new Date(epoch * 1000);
    return d.toLocaleTimeString();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Medallion Architecture Lineage Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="border-b border-slate-800 pb-3 mb-6">
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center">
            <Layers className="w-5 h-5 mr-2 text-blue-500" />
            Medallion Data Lineage (Lakehouse Engine)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Trace how data matures as it flows down the lakehouse tables. Click a layer card to inspect its schema and live records.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative">
          
          {/* Bronze Node */}
          <div 
            onClick={() => setActiveLayer("bronze")}
            className={`flex-1 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
              activeLayer === "bronze" 
                ? "bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/10" 
                : "bg-slate-950/40 border-slate-855 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500/15 rounded text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">enstream.bronze</h4>
                <span className="text-[10px] text-slate-500 font-mono">Iceberg raw landing zone</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs font-mono text-slate-400">
              <p>Type: Append-Only Raw Events</p>
              <p>Format: Parquet (S3)</p>
              <p>Directory: <span className="text-[10px] text-blue-400 font-sans">warehouse/enstream/bronze/data/</span></p>
              <p className="font-bold text-slate-200 mt-2">Active Rows: {stats.bronze_rows || 0}</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-slate-650">
            <ArrowRight className="w-6 h-6 hidden lg:block animate-pulse" />
          </div>

          {/* Silver Node */}
          <div 
            onClick={() => setActiveLayer("silver")}
            className={`flex-1 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
              activeLayer === "silver" 
                ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10" 
                : "bg-slate-950/40 border-slate-855 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-500/15 rounded text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">enstream.silver</h4>
                <span className="text-[10px] text-slate-500 font-mono">Iceberg cleansed zone</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs font-mono text-slate-400">
              <p>Type: Cleaned, Validated & Normed</p>
              <p>Format: Parquet (S3)</p>
              <p>Directory: <span className="text-[10px] text-emerald-400 font-sans">warehouse/enstream/silver/data/</span></p>
              <p className="font-bold text-slate-200 mt-2">Active Rows: {stats.silver_rows || 0}</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-slate-650">
            <ArrowRight className="w-6 h-6 hidden lg:block animate-pulse" />
          </div>

          {/* Gold Node */}
          <div 
            onClick={() => setActiveLayer("gold")}
            className={`flex-1 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
              activeLayer === "gold" 
                ? "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10" 
                : "bg-slate-950/40 border-slate-855 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-500/15 rounded text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">enstream_gold</h4>
                <span className="text-[10px] text-slate-500 font-mono">Redshift aggregate table</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs font-mono text-slate-400">
              <p>Type: OLAP Feature aggregates</p>
              <p>Format: Relational OLAP</p>
              <p>Database: <span className="text-[10px] text-amber-400 font-sans">dw.enstream_gold</span></p>
              <p className="font-bold text-slate-200 mt-2">Gold Profiles: {stats.gold_rows || 0}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main content grid: Left Schema Dictionary, Right Live Records */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Data model and field descriptions */}
        <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {activeLayer.toUpperCase()} Data Model & Schema
            </h4>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {schemas[activeLayer].map((field) => (
              <div key={field.name} className="p-2.5 bg-slate-950/80 rounded border border-slate-850 text-xs">
                <div className="flex justify-between font-mono text-[11px] mb-0.5">
                  <span className="text-blue-400 font-bold">{field.name}</span>
                  <span className="text-slate-500">[{field.type}]</span>
                </div>
                <p className="text-slate-400 text-[10.5px] leading-snug">{field.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Table Explorer */}
        <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live Data Explorer: <span className="text-blue-400">{activeLayer === "bronze" ? "enstream.bronze" : activeLayer === "silver" ? "enstream.silver" : "enstream_gold (Redshift)"}</span>
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Showing actual live database entries</span>
          </div>

          <div className="overflow-x-auto min-h-[300px] max-h-[350px]">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {activeLayer === "bronze" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Event ID</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">MSISDN</th>
                        <th className="py-2.5 px-3">Provider</th>
                        <th className="py-2.5 px-3">Ingested At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                      {bronzeData.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-500">No raw records found.</td></tr>
                      ) : (
                        [...bronzeData].reverse().map((row) => (
                          <tr key={row.event_id} className="hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-[100px]" title={row.event_id}>{row.event_id}</td>
                            <td className="py-2.5 px-3 text-amber-400 font-bold">{row.event_type}</td>
                            <td className="py-2.5 px-3 text-slate-200">{row.msisdn}</td>
                            <td className="py-2.5 px-3 uppercase text-blue-400">{row.source}</td>
                            <td className="py-2.5 px-3 text-slate-400">{formatTime(row.ingested_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeLayer === "silver" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Event ID</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">MSISDN</th>
                        <th className="py-2.5 px-3">IMEI</th>
                        <th className="py-2.5 px-3">Carrier</th>
                        <th className="py-2.5 px-3">DQ Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                      {silverData.length === 0 ? (
                        <tr><td colSpan={6} className="py-10 text-center text-slate-500">No silver records found.</td></tr>
                      ) : (
                        [...silverData].reverse().map((row) => (
                          <tr key={row.event_id} className="hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-[100px]" title={row.event_id}>{row.event_id}</td>
                            <td className="py-2.5 px-3 text-amber-400">{row.event_type}</td>
                            <td className="py-2.5 px-3 text-slate-200">{row.msisdn}</td>
                            <td className="py-2.5 px-3 text-slate-300">{row.imei || "-"}</td>
                            <td className="py-2.5 px-3 uppercase text-purple-400">{row.carrier}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.dq_passed 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-rose-500/10 text-rose-455 border border-rose-500/20"
                              }`}>
                                {row.dq_passed ? "PASS" : "FAIL"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeLayer === "gold" && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">MSISDN</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Carrier</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">30d Ports</th>
                        <th className="py-2.5 px-3">IMEI Churn</th>
                        <th className="py-2.5 px-3">Ring Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                      {goldData.length === 0 ? (
                        <tr><td colSpan={7} className="py-10 text-center text-slate-500">No Gold aggregates found.</td></tr>
                      ) : (
                        goldData.map((row) => (
                          <tr key={row.msisdn} className="hover:bg-slate-950/30">
                            <td className="py-2.5 px-3 text-slate-100 font-bold">{row.msisdn}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[90px]">{row.customer_name || "Unknown"}</td>
                            <td className="py-2.5 px-3 uppercase text-purple-400">{row.carrier}</td>
                            <td className="py-2.5 px-3">{row.msisdn_age_days}d</td>
                            <td className="py-2.5 px-3 text-amber-400 font-bold">{row.port_frequency_30d}</td>
                            <td className="py-2.5 px-3 text-amber-400">{row.device_churn_count}</td>
                            <td className="py-2.5 px-3">{row.network_fraud_ring_size}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
