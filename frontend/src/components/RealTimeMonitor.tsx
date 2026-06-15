import React, { useState } from "react";
import { 
  Smartphone, Send, CheckCircle 
} from "lucide-react";

interface RealTimeMonitorProps {
  onSimulateEvent: (eventData: any) => void;
}

export default function RealTimeMonitor({ onSimulateEvent }: RealTimeMonitorProps) {
  const [source, setSource] = useState("bell");
  const [eventType, setEventType] = useState("activation");
  const [msisdn, setMsisdn] = useState("14165559001");
  const [imei, setImei] = useState("35890104772211");
  
  // Porting fields
  const [srcCarrier, setSrcCarrier] = useState("rogers");
  const [tgtCarrier, setTgtCarrier] = useState("bell");
  
  // Blacklist reason
  const [reason, setReason] = useState("identity_theft");
  
  // Customer update
  const [customerName, setCustomerName] = useState("Alice Smith");

  const [activeStep, setActiveStep] = useState<number>(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      source,
      event_type: eventType,
      msisdn,
      imei,
      source_carrier: eventType === "porting" ? srcCarrier : undefined,
      target_carrier: eventType === "porting" ? tgtCarrier : undefined,
      reason: eventType === "fraud_exchange_hit" ? reason : undefined,
      customer_name: eventType === "customer_update" ? customerName : undefined
    };

    onSimulateEvent(payload);

    // Trigger visual pipeline animation
    setActiveStep(0);
    setTimeout(() => setActiveStep(1), 800);  // Ingestion to Bronze
    setTimeout(() => setActiveStep(2), 1600); // Silver Clean check
    setTimeout(() => setActiveStep(3), 2400); // Feature update (dirty flag)
    setTimeout(() => setActiveStep(4), 3200); // Gold rescore
    setTimeout(() => setActiveStep(-1), 4500); // Reset
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Simulation form and visual flowchart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event injection form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Smartphone className="w-4 h-4 mr-2 text-rose-500" />
              Raw Event Ingress Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">Inject custom raw telemetry events directly into EnStream APIs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Event Type */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Event Type:</label>
              <select 
                value={eventType}
                onChange={(e) => {
                  const val = e.target.value;
                  setEventType(val);
                  if (val === "porting") setSource("transunion");
                  else if (val === "customer_update") setSource("mysql");
                  else if (val === "fraud_exchange_hit") setSource("sftp");
                  else setSource("bell");
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
              >
                <option value="activation">SIM Activation (Carrier)</option>
                <option value="device_update">Device SIM Swap (Carrier)</option>
                <option value="porting">Port Request (TransUnion)</option>
                <option value="customer_update">Profile Update (MySQL)</option>
                <option value="fraud_exchange_hit">Cross-Sector Match (SFTP)</option>
              </select>
            </div>

            {/* Source */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Ingestion Source Channel:</label>
              <select 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={["porting", "customer_update", "fraud_exchange_hit"].includes(eventType)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none disabled:opacity-50"
              >
                <option value="bell">Bell Mobility API</option>
                <option value="rogers">Rogers Wireless API</option>
                <option value="telus">Telus Carrier API</option>
                <option value="transunion">TransUnion PortPS (Port Validation)</option>
                <option value="mysql">MySQL CDC Binlog (Operational Database)</option>
                <option value="sftp">SFTP Ingest (Cross-Sector Fraud Exchange)</option>
              </select>
            </div>

            {/* MSISDN */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Target Phone (MSISDN):</label>
              <input 
                type="text" 
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="10-digit number"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none font-mono"
              />
            </div>

            {/* Dynamic Fields */}
            {eventType === "activation" && (
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Device IMEI:</label>
                <input 
                  type="text" 
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none font-mono"
                />
              </div>
            )}

            {eventType === "device_update" && (
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">New Device IMEI:</label>
                <input 
                  type="text" 
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none font-mono"
                />
              </div>
            )}

            {eventType === "porting" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Source Carrier:</label>
                  <select 
                    value={srcCarrier} 
                    onChange={(e) => setSrcCarrier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-2 text-slate-200 outline-none"
                  >
                    <option value="bell">Bell</option>
                    <option value="rogers">Rogers</option>
                    <option value="telus">Telus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Target Carrier:</label>
                  <select 
                    value={tgtCarrier} 
                    onChange={(e) => setTgtCarrier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-2 text-slate-200 outline-none"
                  >
                    <option value="bell">Bell</option>
                    <option value="rogers">Rogers</option>
                    <option value="telus">Telus</option>
                  </select>
                </div>
              </div>
            )}

            {eventType === "customer_update" && (
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Customer Master Name:</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
                />
              </div>
            )}

            {eventType === "fraud_exchange_hit" && (
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Reported Fraud Type:</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="identity_theft">Identity Theft</option>
                  <option value="sim_swap_mule">SIM Swap Money Mule</option>
                  <option value="sms_phishing">Phishing Syndicate Linkage</option>
                </select>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-slate-100 font-bold rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md shadow-rose-900/30"
            >
              <Send className="w-4 h-4" /> <span>Publish to Event Bus</span>
            </button>
          </form>
        </div>

        {/* Live processing visual pipeline animation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Telemetry Pipelines & Real-time Flow
            </h3>
            <p className="text-xs text-slate-400 mt-1">Tracks events flowing down the medallion hierarchy</p>
          </div>

          <div className="flex flex-col space-y-4 justify-center py-4">
            
            {/* Step 1: Kafka Event */}
            <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
              activeStep === 0 ? "bg-blue-500/10 border-blue-500 animate-pulse" : activeStep > 0 ? "bg-slate-950/40 border-slate-800 opacity-60" : "bg-slate-950/10 border-slate-900 opacity-30"
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
                <span className="font-mono text-slate-200 uppercase">Kafka Ingress Topic</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{activeStep === 0 ? "Publishing raw record..." : activeStep > 0 ? "Published" : "Waiting"}</span>
            </div>

            {/* Step 2: Bronze write */}
            <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
              activeStep === 1 ? "bg-blue-500/15 border-blue-500 animate-pulse" : activeStep > 1 ? "bg-slate-950/40 border-slate-800 opacity-60" : "bg-slate-950/10 border-slate-900 opacity-30"
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
                <span className="font-mono text-slate-200 uppercase">Bronze Layer (Append Iceberg)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{activeStep === 1 ? "Writing raw parquet..." : activeStep > 1 ? "Committed" : "Waiting"}</span>
            </div>

            {/* Step 3: Silver Validation */}
            <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
              activeStep === 2 ? "bg-emerald-500/15 border-emerald-500 animate-pulse" : activeStep > 2 ? "bg-slate-950/40 border-slate-800 opacity-60" : "bg-slate-950/10 border-slate-900 opacity-30"
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
                <span className="font-mono text-slate-200 uppercase">Silver Layer (Data Quality & Normalization)</span>
              </div>
              <span className="text-[10px] text-slate-450 font-mono flex items-center">
                {activeStep === 2 ? (
                  "Evaluating assertions..."
                ) : activeStep > 2 ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> DQ Pass
                  </>
                ) : (
                  "Waiting"
                )}
              </span>
            </div>

            {/* Step 4: Feature store trigger */}
            <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
              activeStep === 3 ? "bg-amber-500/15 border-amber-500 animate-pulse" : activeStep > 3 ? "bg-slate-950/40 border-slate-800 opacity-60" : "bg-slate-950/10 border-slate-900 opacity-30"
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">4</div>
                <span className="font-mono text-slate-200 uppercase">Dirty Flag & Feature Store Recompute</span>
              </div>
              <span className="text-[10px] text-slate-450 font-mono">{activeStep === 3 ? "Updating Online Store..." : activeStep > 3 ? "Features Cached" : "Waiting"}</span>
            </div>

            {/* Step 5: Gold scoring */}
            <div className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
              activeStep === 4 ? "bg-rose-500/15 border-rose-500 animate-pulse" : "bg-slate-950/10 border-slate-900 opacity-30"
            }`}>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">5</div>
                <span className="font-mono text-slate-200 uppercase">Gold Layer & Real-time rescore</span>
              </div>
              <span className="text-[10px] text-slate-450 font-mono">{activeStep === 4 ? "Calculating Trust Score..." : "Waiting"}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
