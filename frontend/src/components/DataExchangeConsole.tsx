import React, { useState, useEffect } from "react";
import { 
  Upload, Search, Shield, Activity, FileText, CheckCircle, 
  AlertTriangle, Server, Database, UserCheck, RefreshCw, 
  Lock, Unlock, Clock, AlertCircle, BarChart2, ShieldAlert
} from "lucide-react";
import { BACKEND_URL } from "../config";

export default function DataExchangeConsole() {
  const [activeSubTab, setActiveSubTab] = useState<"contribute" | "lookup" | "audit" | "metrics">("contribute");
  const [exchangeState, setExchangeState] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Contribution Form state
  const [contribMsisdn, setContribMsisdn] = useState("+14165550200");
  const [contribImei, setContribImei] = useState("35890104998877");
  const [contribName, setContribName] = useState("Alice Smith");
  const [contribEmail, setContribEmail] = useState("alice.s@gmail.com");
  const [contribAddress, setContribAddress] = useState("456 Yonge St, Toronto, ON");
  const [contribIp, setContribIp] = useState("192.168.2.11");
  const [contribFraudType, setContribFraudType] = useState("synthetic_id");
  const [contribSource, setContribSource] = useState("online_banking_login");
  const [contribParticipant, setContribParticipant] = useState("TD_BANK");
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Lookup Form state
  const [lookupMsisdn, setLookupMsisdn] = useState("+14165551234");
  const [lookupImei, setLookupImei] = useState("356789012345678");
  const [lookupName, setLookupName] = useState("John Smith");
  const [lookupAddress, setLookupAddress] = useState("456 Bay St, Toronto, ON");
  const [lookupParticipant, setLookupParticipant] = useState("RBC_BANK");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [tracerStep, setTracerStep] = useState<number>(-1);

  // Governance state
  const [userRole, setUserRole] = useState<"participant_lookup" | "telco_verify_ai_service">("participant_lookup");
  const [correctionRecordId, setCorrectionRecordId] = useState("");
  const [correctionReason, setCorrectionReason] = useState("data_entry_error");
  const [correctionStatus, setCorrectionStatus] = useState("withdrawn");
  const [correctionResult, setCorrectionResult] = useState<any>(null);

  const fetchExchangeState = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/exchange/state`);
      if (res.ok) {
        const data = await res.json();
        setExchangeState(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/exchange/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExchangeState();
    fetchLogs();
  }, []);

  const handleContribSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/exchange/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: contribParticipant,
          msisdn: contribMsisdn,
          imei: contribImei || null,
          pii_name: contribName || null,
          pii_email: contribEmail || null,
          pii_address: contribAddress || null,
          pii_ip_address: contribIp || null,
          fraud_type: contribFraudType,
          source: contribSource
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitResult(data);
        fetchExchangeState();
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupResult(null);
    setSearching(true);
    setTracerStep(0);

    const steps = [
      { delay: 400, step: 1 },
      { delay: 900, step: 2 },
      { delay: 1400, step: 3 },
      { delay: 1900, step: 4 },
      { delay: 2400, step: 5 }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setTracerStep(s.step);
      }, s.delay);
    });

    setTimeout(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/exchange/lookup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant_id: lookupParticipant,
            msisdn: lookupMsisdn,
            imei: lookupImei || null,
            pii_name: lookupName || null,
            pii_address: lookupAddress || null
          })
        });

        if (res.ok) {
          const data = await res.json();
          setLookupResult(data);
          fetchExchangeState();
          fetchLogs();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
        setTracerStep(-1);
      }
    }, 2800);
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorrectionResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/exchange/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: lookupParticipant,
          record_id: correctionRecordId,
          reason: correctionReason,
          record_status: correctionStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCorrectionResult(data);
        fetchExchangeState();
        fetchLogs();
        setCorrectionRecordId("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleString();
  };

  const maskPII = (val: string) => {
    if (!val) return "";
    if (val === "<purged>" || val === "&lt;purged&gt;") return <span className="text-slate-500 italic font-sans text-[10px]">purged (PIPEDA 30d)</span>;
    if (userRole === "participant_lookup") {
      return (
        <span className="inline-flex items-center text-slate-500 font-mono text-[9px] bg-slate-950 px-1 py-0.5 rounded border border-slate-900">
          <Lock className="w-2.5 h-2.5 mr-1 text-slate-600" />
          MASKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-emerald-450 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
        <Unlock className="w-2.5 h-2.5 mr-1 text-emerald-600" />
        {val}
      </span>
    );
  };

  const stats = exchangeState?.stats || { total_records: 0, total_submissions: 0, total_lookups: 0, total_corrections: 0 };
  const participants = exchangeState?.participants || [];
  const records = exchangeState?.records || [];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* 4-Pillar Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h1 className="text-sm font-black text-slate-200 tracking-wider uppercase">Cross-Sector Bad Actor Data Exchange</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
            A shared, governed clearinghouse enabling banks and telecommunication companies to contribute confirmed fraud records and perform real-time checks to eliminate repeat fraud.
          </p>
        </div>

        {/* Dynamic statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/65 p-3 rounded-lg border border-slate-850 shrink-0">
          <div className="px-3 py-1">
            <span className="block text-[10px] text-slate-500 font-mono uppercase">Exchange Records</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{stats.total_records}</span>
          </div>
          <div className="px-3 py-1 border-l border-slate-850">
            <span className="block text-[10px] text-slate-500 font-mono uppercase">Batch Uploads</span>
            <span className="text-lg font-bold font-mono text-blue-400">{stats.total_submissions}</span>
          </div>
          <div className="px-3 py-1 border-l border-slate-850">
            <span className="block text-[10px] text-slate-500 font-mono uppercase">API Lookups</span>
            <span className="text-lg font-bold font-mono text-amber-500">{stats.total_lookups}</span>
          </div>
          <div className="px-3 py-1 border-l border-slate-850">
            <span className="block text-[10px] text-slate-500 font-mono uppercase">Corrections</span>
            <span className="text-lg font-bold font-mono text-rose-500">{stats.total_corrections}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 space-x-1 p-0.5 bg-slate-900/60 rounded-lg max-w-2xl">
        <button
          onClick={() => setActiveSubTab("contribute")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
            activeSubTab === "contribute" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>1. Data Contribution</span>
        </button>
        <button
          onClick={() => setActiveSubTab("lookup")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
            activeSubTab === "lookup" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>2. Real-Time Lookup</span>
        </button>
        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
            activeSubTab === "audit" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>3. Audit & Governance</span>
        </button>
        <button
          onClick={() => setActiveSubTab("metrics")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
            activeSubTab === "metrics" ? "bg-slate-800 text-blue-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>4. Success Metrics</span>
        </button>
      </div>

      {/* PILLAR 1: DATA CONTRIBUTION */}
      {activeSubTab === "contribute" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          
          {/* File submission builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
            <h2 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center">
              <Upload className="w-4 h-4 mr-2 text-blue-500" />
              Batch Ingestion File Simulator (SFTP / S3)
            </h2>
            
            <form onSubmit={handleContribSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Submitting Participant</label>
                <select 
                  value={contribParticipant}
                  onChange={(e) => setContribParticipant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {participants.map((p: any) => (
                    <option key={p.participant_id} value={p.participant_id}>
                      {p.display_name} ({p.sector.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number (Mandatory, E.164)</label>
                <input 
                  type="text" 
                  value={contribMsisdn}
                  onChange={(e) => setContribMsisdn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="+14165550200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Device IMEI (Optional, 15 digits)</label>
                <input 
                  type="text" 
                  value={contribImei}
                  onChange={(e) => setContribImei(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="35890104998877"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Fraud Taxonomy Category</label>
                <select 
                  value={contribFraudType}
                  onChange={(e) => setContribFraudType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="synthetic_id">Synthetic Identity Fraud</option>
                  <option value="first_party_fraud">First Party Fraud</option>
                  <option value="account_opening_fraud">Account Opening Fraud</option>
                  <option value="account_takeover">Account Takeover (ATO)</option>
                  <option value="sim_swap">SIM Swap Fraud</option>
                  <option value="impersonation">Identity Impersonation</option>
                  <option value="invalid_taxonomy_code">Invalid Taxonomy Code (Test Reject)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Bad Actor Full Name (Optional PII)</label>
                <input 
                  type="text" 
                  value={contribName}
                  onChange={(e) => setContribName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Alice Smith"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Bad Actor Email (Optional PII)</label>
                <input 
                  type="email" 
                  value={contribEmail}
                  onChange={(e) => setContribEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="alice.s@gmail.com"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Bad Actor Address (Optional PII)</label>
                <input 
                  type="text" 
                  value={contribAddress}
                  onChange={(e) => setContribAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="456 Yonge St, Toronto, ON"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Source Channel Details</label>
                <input 
                  type="text" 
                  value={contribSource}
                  onChange={(e) => setContribSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="online_banking_login"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Bad Actor IP Address (Optional)</label>
                <input 
                  type="text" 
                  value={contribIp}
                  onChange={(e) => setContribIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="192.168.2.11"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-slate-100 py-2.5 rounded text-xs font-bold uppercase transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{loading ? "Ingesting..." : "Submit Batch to SFTP/S3 Drop"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Validation Feedback & Closed-loop Response */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase text-slate-355 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <Activity className="w-4 h-4 mr-2 text-emerald-450" />
                Ingestion Engine Feedback Trace
              </h2>
              
              {!submitResult ? (
                <div className="text-slate-500 text-xs italic text-center py-20">
                  Submit a batch file to observe real-time validation results and error logs.
                </div>
              ) : (
                <div className="space-y-4 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">File ID:</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 truncate max-w-[150px]">
                      {submitResult.record?.file_id || submitResult.file_id || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-850/60 pt-2.5">
                    <span className="text-xs text-slate-400">Ingestion Status:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                      submitResult.status === "accepted" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : 
                      submitResult.status === "duplicate" ? "bg-amber-500/10 text-amber-450 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                    }`}>
                      {submitResult.status}
                    </span>
                  </div>

                  {/* Schema rules checklist */}
                  <div className="space-y-2 border-t border-slate-850/60 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Schema Verification Pipeline:</span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Check SFTP File Encoding</span>
                        <span className="text-emerald-405 font-bold">PASS</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Check E.164 phone format</span>
                        {submitResult.error && submitResult.error.includes("E.164") ? (
                          <span className="text-rose-500 font-bold">FAIL</span>
                        ) : (
                          <span className="text-emerald-405 font-bold">PASS</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Validate Taxonomy Enum</span>
                        {submitResult.error && submitResult.error.includes("taxonomy") ? (
                          <span className="text-rose-500 font-bold">FAIL</span>
                        ) : (
                          <span className="text-emerald-405 font-bold">PASS</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Deduplicate Submission</span>
                        {submitResult.status === "duplicate" ? (
                          <span className="text-amber-500 font-bold">DUPLICATE</span>
                        ) : (
                          <span className="text-emerald-405 font-bold">PASS</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {submitResult.error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 text-xs mt-3 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
                      <span>{submitResult.error}</span>
                    </div>
                  )}

                  {submitResult.status === "accepted" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-400 text-xs mt-3 flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
                      <span>Record conformed and successfully appended to Silver & Gold exchange layers.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-500 font-mono mt-3">
              <span className="text-slate-400 font-bold">Closed-loop Feedback:</span> In production, participants receive detailed JSON files in their SFTP directories detailing which rows were accepted/rejected with error codes.
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2 & 3: REAL-TIME LOOKUP */}
      {activeSubTab === "lookup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
          
          {/* Query input card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-4 space-y-4">
            <h2 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center">
              <Search className="w-4 h-4 mr-2 text-blue-500" />
              API Lookup Query Simulator
            </h2>

            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Querying Participant</label>
                <select 
                  value={lookupParticipant}
                  onChange={(e) => setLookupParticipant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {participants.map((p: any) => (
                    <option key={p.participant_id} value={p.participant_id}>
                      {p.display_name} ({p.sector.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number (Required, E.164)</label>
                <input 
                  type="text" 
                  value={lookupMsisdn}
                  onChange={(e) => setLookupMsisdn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="+14165551234"
                  required
                />
                <span className="text-[9px] text-slate-550 block">Try <span className="font-mono text-slate-400 font-bold cursor-pointer hover:text-blue-400" onClick={() => setLookupMsisdn("+14165551234")}>+14165551234</span> (Recycled) or <span className="font-mono text-slate-400 font-bold cursor-pointer hover:text-blue-400" onClick={() => setLookupMsisdn("+14165559001")}>+14165559001</span> (Owned)</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">IMEI Number (Optional)</label>
                <input 
                  type="text" 
                  value={lookupImei}
                  onChange={(e) => setLookupImei(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="356789012345678"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">First Name (Optional PII Match)</label>
                <input 
                  type="text" 
                  value={lookupName}
                  onChange={(e) => setLookupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Address (Optional PII Match)</label>
                <input 
                  type="text" 
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="456 Bay St, Toronto, ON"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700 text-slate-950 py-2.5 rounded text-xs font-black uppercase transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{searching ? "Verifying..." : "Execute API Lookup Query"}</span>
              </button>
            </form>
          </div>

          {/* Trace animation & Response payload JSON */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* API Ingress pipeline animation */}
            {searching && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-amber-550 tracking-wider flex items-center animate-pulse">
                  <Clock className="w-4 h-4 mr-2" />
                  MNO Activation & TU Porting Tracer APIs Active
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                  <div className={`p-2 rounded border ${tracerStep >= 0 ? "bg-blue-600/10 border-blue-500/40 text-blue-400 animate-pulse" : "bg-slate-950 border-slate-850 opacity-40"}`}>
                    <span>1. Ingress</span>
                  </div>
                  <div className={`p-2 rounded border ${tracerStep >= 1 ? "bg-blue-600/10 border-blue-500/40 text-blue-400 animate-pulse" : "bg-slate-950 border-slate-850 opacity-40"}`}>
                    <span>2. S3/SFTP</span>
                  </div>
                  <div className={`p-2 rounded border ${tracerStep >= 2 ? "bg-blue-600/10 border-blue-500/40 text-blue-400 animate-pulse" : "bg-slate-950 border-slate-850 opacity-40"}`}>
                    <span>3. SLA checks</span>
                  </div>
                  <div className={`p-2 rounded border ${tracerStep >= 3 ? "bg-amber-600/15 border-amber-500/40 text-amber-400 animate-pulse" : "bg-slate-950 border-slate-850 opacity-40"}`}>
                    <span>4. MNO Activation</span>
                  </div>
                  <div className={`p-2 rounded border ${tracerStep >= 4 ? "bg-teal-600/15 border-teal-500/40 text-teal-400 animate-pulse" : "bg-slate-950 border-slate-850 opacity-40"}`}>
                    <span>5. TU Porting</span>
                  </div>
                </div>
              </div>
            )}

            {lookupResult && (
              <div className="space-y-4">
                
                {/* Warnings / Disclaimers display if mismatch */}
                {lookupResult.match_summary.phone_number_match && !lookupResult.match_summary.imei_match && lookupResult.query.imei && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-450 text-xs flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase block">Pillar 3 Lookup Warning (IMEI Mismatch)</span>
                      <p className="mt-1 text-slate-300">
                        The phone number matches a confirmed fraud record. However, the provided IMEI does not match the hardware associated at the time of the fraud event. Proceed with caution.
                      </p>
                    </div>
                  </div>
                )}

                {lookupResult.match_summary.imei_match && !lookupResult.match_summary.phone_number_match && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-455 text-xs flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase block">Pillar 3 Lookup Warning (MSISDN Mismatch)</span>
                      <p className="mt-1 text-slate-300">
                        The device IMEI matches a confirmed fraud syndicate record. However, the querying phone number does not match the original record.
                      </p>
                    </div>
                  </div>
                )}

                {/* Match Summary Indicator card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-slate-950/80 border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Lookup Results</span>
                    <span className={`text-sm font-black uppercase tracking-wider block mt-1 ${
                      lookupResult.match_summary.match_count > 0 ? "text-rose-500 animate-pulse" : "text-emerald-450"
                    }`}>
                      {lookupResult.match_summary.match_count > 0 ? "⚠️ MATCH DETECTED" : "✅ CLEAN RECORD"}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Recycle Lineage Status</span>
                    <span className={`text-sm font-black uppercase tracking-wider block mt-1 ${
                      lookupResult.phone_number_result.recycled_status.recycle_status === "RECYCLED" ? "text-amber-450" : "text-emerald-450"
                    }`}>
                      {lookupResult.phone_number_result.recycled_status.recycle_status}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-slate-950/80 border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Match Count / Sources</span>
                    <span className="text-sm font-bold block mt-1 text-slate-300 font-mono">
                      {lookupResult.match_summary.match_count} Matches ({lookupResult.match_summary.source_sector_count} Sectors)
                    </span>
                  </div>
                </div>

                {/* Bitemporal JSON Response Output */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs uppercase font-extrabold text-slate-350 tracking-wider flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      JSON API Response Contract Payload
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">POST /v1/lookup</span>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 max-h-[300px] overflow-y-auto">
                    <pre className="text-xs font-mono text-amber-400 leading-relaxed">
                      {JSON.stringify(lookupResult, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            )}

            {!searching && !lookupResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-lg text-slate-550 italic">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-755 animate-pulse" />
                <p className="text-xs">Submit a lookup query on the left. The tracer will fetch real-time MNO activation timestamps, verify recycle status logic, and match PII score weights.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* PILLAR 4: AUDIT & GOVERNANCE */}
      {activeSubTab === "audit" && (
        <div className="space-y-6">
          
          {/* Controls bar: RBAC Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xs uppercase font-extrabold text-slate-355 tracking-wider flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                GDPR/PIPEDA Privacy Masking & Governance Controls
              </h2>
              <p className="text-[11px] text-slate-450 mt-0.5 font-sans">
                The clearinghouse enforces data minimization. Direct PII (Name, Email, Address, IP) is only exposed to authorized internal microservices like <span className="font-bold text-slate-300 font-mono">Telco Verify AI</span>.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              <label className="text-[10px] uppercase font-bold text-slate-400">Enforce RBAC Role:</label>
              <select
                value={userRole}
                onChange={(e: any) => setUserRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="participant_lookup">participant_lookup (PII Redacted)</option>
                <option value="telco_verify_ai_service">telco_verify_ai_service (Unmasked)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
            
            {/* Correction Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h2 className="text-xs font-extrabold uppercase text-slate-355 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />
                Record Correction Flow
              </h2>

              <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Record UUID to modify</label>
                  <input 
                    type="text" 
                    value={correctionRecordId}
                    onChange={(e) => setCorrectionRecordId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Enter record UUID"
                    required
                  />
                  <span className="text-[9px] text-slate-550">Copy a record ID from the conformed list below.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Reason for correction</label>
                  <select 
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="mistakenly_flagged">Mistakenly Flagged / Subject Dispute</option>
                    <option value="data_entry_error">Data Entry Error</option>
                    <option value="subject_dispute">Subject Cleared of Fraud Attempt</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Updated record status</label>
                  <select 
                    value={correctionStatus}
                    onChange={(e) => setCorrectionStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="withdrawn">Withdrawn (Submission Error)</option>
                    <option value="cleared">Cleared (Cleared of fraud)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-slate-100 py-2.5 rounded text-xs font-bold uppercase transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execute Status Update</span>
                </button>
              </form>

              {correctionResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded text-emerald-400 text-[11px] flex items-start space-x-2 font-mono">
                  <CheckCircle className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">STATUS UPDATED</span>
                    <p className="mt-1 text-slate-300">
                      Record status changed to {correctionResult.record?.record_status?.toUpperCase()}. PII fields purged immediately to satisfy 30-day compliance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ingress Conformed Records List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-extrabold uppercase text-slate-355 tracking-wider flex items-center">
                  <Database className="w-4 h-4 mr-2 text-blue-500" />
                  Conformed Bad Actor Gold Database (Active)
                </h2>
                <button onClick={fetchExchangeState} className="text-slate-400 hover:text-slate-250">
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {records.length === 0 ? (
                  <p className="text-slate-600 italic text-center py-12 text-xs">No active records found in the exchange database.</p>
                ) : (
                  records.map((rec: any) => (
                    <div key={rec.record_id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-blue-450 font-bold uppercase">[{rec.participant_id}]</span>
                          <span className="text-slate-400">Phone: <span className="text-slate-200">{rec.msisdn}</span></span>
                          <span className="text-slate-500">IMEI: <span className="text-slate-300">{rec.imei || "N/A"}</span></span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          <span>UUID: <span className="text-slate-450 select-all cursor-pointer font-bold hover:text-blue-400 transition-colors" onClick={() => setCorrectionRecordId(rec.record_id)}>{rec.record_id}</span></span>
                          <span className="ml-3">Fraud: <span className="text-slate-400">{rec.fraud_type.toUpperCase()}</span></span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-850/50">
                          <span>Name: {maskPII(rec.pii_name)}</span>
                          <span>Email: {maskPII(rec.pii_email)}</span>
                          <span>Address: {maskPII(rec.pii_address)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          rec.record_status === "active" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {rec.record_status}
                        </span>
                        <span className="block text-[8px] text-slate-555 mt-1 uppercase font-bold">Lineage: {rec.ownership_status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Governance Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              Immutable Audit Logs Ledger
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-855 pb-1 block">Onboarding Audits</span>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {logs?.onboarding?.map((item: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-950/80 rounded border border-slate-850">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{item.institution_name}</span>
                        <span className="text-emerald-400 font-extrabold">ACTIVE</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        <span>Sector: {item.sector.toUpperCase()}</span>
                        <span className="block mt-0.5 font-bold">Onboarded: {formatTime(item.time_of_onboarding)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-855 pb-1 block">Ingress Submissions</span>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {logs?.submissions?.map((item: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-950/80 rounded border border-slate-850">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{item.participant_id}</span>
                        <span className={`text-[9px] uppercase font-bold ${item.parse_status === "parsed" ? "text-emerald-450" : "text-rose-500"}`}>{item.parse_status}</span>
                      </div>
                      <div className="text-[10px] text-slate-550 mt-1">
                        <span>Transport: {item.source_type.toUpperCase()}</span>
                        {item.quarantine_reason && <span className="block text-rose-500 font-bold">Error: {item.quarantine_reason}</span>}
                        <span className="block mt-0.5">Time: {formatTime(item.received_ts)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-855 pb-1 block">Lookup Audits</span>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {logs?.lookups?.map((item: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-950/80 rounded border border-slate-850">
                      <div className="flex justify-between font-bold text-slate-300 font-mono">
                        <span>{item.participant_id}</span>
                        <span className="text-amber-500 font-extrabold">QUERY</span>
                      </div>
                      <div className="text-[10px] text-slate-555 mt-1">
                        <span>MSISDN: {item.request_msisdn}</span>
                        <span className="block">Match Phone/IMEI: {item.phone_number_match ? "Yes" : "No"}/{item.imei_match ? "Yes" : "No"}</span>
                        <span className="block mt-0.5">Time: {formatTime(item.request_ts)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PILLAR 4: SUCCESS METRICS */}
      {activeSubTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          
          {/* KPI Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-450 uppercase">Repeat Fraud Reduction</span>
              <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-emerald-450">82.4%</span>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">↑ 6.2% MoM</span>
            </div>
            <p className="text-[11px] text-slate-505 leading-normal font-sans">
              Percentage of repeat fraud events prevented across financial and telecom participants by using shared bad actor lookup lists.
            </p>
          </div>

          {/* KPI Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-450 uppercase">Cross-Partner Match Rate</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-blue-455">18.5%</span>
              <span className="text-[10px] text-blue-500 font-bold font-mono">152 detections</span>
            </div>
            <p className="text-[11px] text-slate-505 leading-normal font-sans">
              Ratio of queries that matched a confirmed bad actor record submitted by another participant in the clearinghouse.
            </p>
          </div>

          {/* KPI Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-450 uppercase">False-Positive Dispute Rate</span>
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-rose-500 font-extrabold">0.08%</span>
              <span className="text-[10px] text-rose-500 font-bold font-mono">↓ 0.02% QoQ</span>
            </div>
            <p className="text-[11px] text-slate-505 leading-normal font-sans">
              Disputed customer complaints or false positives triggered by out-of-date records or recycled phone numbers.
            </p>
          </div>

          {/* SVG Progress chart 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-350 tracking-wider">
              Participant Match Contribution (By Industry Sector)
            </h3>
            
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Banking Sector (TD, RBC, CIBC)</span>
                  <span className="text-blue-400 font-bold font-mono">58% Matches</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "58%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Telecom Sector (Bell, Rogers, Telus)</span>
                  <span className="text-indigo-400 font-bold font-mono">32% Matches</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Other (Fintech, Insurers)</span>
                  <span className="text-slate-550 font-bold font-mono">10% Matches</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: "10%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Speed & SLAs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-350 tracking-wider">
              Service SLAs & Performance Status
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-450">API Query Response Latency</span>
                <span className="text-emerald-450 font-bold font-extrabold">0.05s (SLA &lt;2.0s)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-450">Monthly System Availability</span>
                <span className="text-emerald-450 font-bold font-extrabold">99.98% (SLA 99.9%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-450">Ingestion Batch Latency</span>
                <span className="text-emerald-450 font-bold font-extrabold">1.2h (SLA &lt;24h)</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
