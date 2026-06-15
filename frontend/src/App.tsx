import React, { useState, useEffect } from "react";
import { 
  Activity, Database, Cpu, 
  Smartphone, BarChart2, Search, AlertCircle, Code, GitMerge, Shuffle,
  Menu, X
} from "lucide-react";

// Components
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import OperationsConsole from "./components/OperationsConsole";
import DataPlatformConsole from "./components/DataPlatformConsole";
import DQMonitoringConsole from "./components/DQMonitoringConsole";
import MLPlatformConsole from "./components/MLPlatformConsole";
import FraudInvestigationConsole from "./components/FraudInvestigationConsole";
import RealTimeMonitor from "./components/RealTimeMonitor";
import TechnicalArchitecture from "./components/TechnicalArchitecture";
import MedallionArchitectureConsole from "./components/MedallionArchitectureConsole";
import DataExchangeConsole from "./components/DataExchangeConsole";

import { BACKEND_URL } from "./config";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "executive" | "operations" | "data" | "medallion_architecture" | "dq" | "ml" | "investigation" | "realtime" | "architecture" | "data_exchange"
  >("executive");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stateData, setStateData] = useState<any>(null);
  const [eventLogs, setEventLogs] = useState<any[]>([]);
  const [searchMsisdn, setSearchMsisdn] = useState("");
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [rescoreLoading, setRescoreLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  const fetchState = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/state`);
      if (res.ok) {
        const data = await res.json();
        setStateData(data);
        setApiOnline(true);
      }
    } catch (err) {
      console.error("Backend offline", err);
      setApiOnline(false);
    }
  };

  const fetchEntityDetails = async (msisdn: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/entity/${msisdn}`);
      if (res.ok) {
        const data = await res.json();
        setEntityDetails(data);
      }
    } catch (err) {
      console.error("Error fetching entity", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMsisdn) {
      fetchEntityDetails(searchMsisdn);
    }
  };

  const handleSelectMsisdn = (msisdn: string) => {
    setSearchMsisdn(msisdn);
    fetchEntityDetails(msisdn);
    setActiveTab("investigation");
  };

  const handleRescore = async (msisdn: string) => {
    setRescoreLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rescore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msisdn })
      });
      if (res.ok) {
        await fetchEntityDetails(msisdn);
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRescoreLoading(false);
    }
  };

  const handleSimulateEvent = async (payload: any) => {
    try {
      await fetch(`${BACKEND_URL}/api/simulate-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromoteModel = async (version: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/model/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version })
      });
      if (res.ok) {
        await fetchState();
        if (entityDetails?.msisdn) {
          fetchEntityDetails(entityDetails.msisdn);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollbackModel = async (version: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/model/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version })
      });
      if (res.ok) {
        await fetchState();
        if (entityDetails?.msisdn) {
          fetchEntityDetails(entityDetails.msisdn);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainModel = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/mlops/train`, { method: "POST" });
      setTimeout(fetchState, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSimulation = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/simulation/toggle`, { method: "POST" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulationSpeedChange = async (speed: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/simulation/speed?speed=${speed}`, { method: "POST" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);

    const sse = new EventSource(`${BACKEND_URL}/api/stream`);
    
    sse.addEventListener("kafka_event", (e: any) => {
      const data = JSON.parse(e.data);
      setEventLogs(prev => [...prev, data].slice(-100));
    });

    sse.addEventListener("silver_processed", () => {
      fetchState();
    });

    sse.addEventListener("score_refreshed", (e: any) => {
      const data = JSON.parse(e.data);
      fetchState();
      if (entityDetails?.msisdn === data.msisdn) {
        fetchEntityDetails(data.msisdn);
      }
    });

    return () => {
      clearInterval(interval);
      sse.close();
    };
  }, [entityDetails]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 z-50 transform transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 font-sans">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-slate-100 font-extrabold shadow-lg shadow-blue-500/20">
                ES
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-200">EnStream</h1>
                <span className="text-[10px] text-blue-500 font-mono tracking-widest uppercase">Fraud Intelligence</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => { setActiveTab("executive"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "executive" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="w-4 h-4" /> <span>Executive Desk</span>
            </button>
            <button 
              onClick={() => { setActiveTab("operations"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "operations" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4" /> <span>Ops Center</span>
            </button>
            <button 
              onClick={() => { setActiveTab("data_exchange"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "data_exchange" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Shuffle className="w-4 h-4" /> <span>Exchange Hub</span>
            </button>
            <button 
              onClick={() => { setActiveTab("data"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "data" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4" /> <span>Data Explorer</span>
            </button>
            <button 
              onClick={() => { setActiveTab("medallion_architecture"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "medallion_architecture" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <GitMerge className="w-4 h-4" /> <span>Medallion Spec</span>
            </button>
            <button 
              onClick={() => { setActiveTab("dq"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "dq" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <AlertCircle className="w-4 h-4" /> <span>DQ Monitor</span>
            </button>
            <button 
              onClick={() => { setActiveTab("ml"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "ml" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-4 h-4" /> <span>ML Registry</span>
            </button>
            <button 
              onClick={() => { setActiveTab("investigation"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "investigation" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Search className="w-4 h-4" /> <span>Query Investigator</span>
            </button>
            <button 
              onClick={() => { setActiveTab("realtime"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "realtime" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-4 h-4" /> <span>Event Ingress</span>
            </button>
            <button 
              onClick={() => { setActiveTab("architecture"); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeTab === "architecture" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              <Code className="w-4 h-4" /> <span>Technical Working</span>
            </button>
          </nav>
        </div>

        {/* Connection status footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">FastAPI Engine:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
              apiOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}>
              {apiOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 text-[10px] text-slate-500 font-mono">
            <span className="text-slate-400 font-bold">WAREHOUSE:</span>
            <span className="block truncate mt-0.5">S3 / Iceberg / Redshift</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        
        {/* Header toolbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-slate-200 focus:outline-none animate-fadeIn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider truncate">
              {activeTab === "executive" && "Operations Center: Executive Control Room"}
              {activeTab === "operations" && "Operations Center: Event Stream Console"}
              {activeTab === "data_exchange" && "Data Exchange: Cross-Sector Fraud Clearinghouse"}
              {activeTab === "data" && "Data Platform: Live Warehouse Explorer"}
              {activeTab === "medallion_architecture" && "Data Platform: Medallion Spec & Schemas"}
              {activeTab === "dq" && "Data Quality Framework: SLA Quality Assurances"}
              {activeTab === "ml" && "ML Platform Console: Model Registry & Drift Metrics"}
              {activeTab === "investigation" && "Fraud Investigation Console: Entity Lookup"}
              {activeTab === "realtime" && "Real-Time Event Ingress: Manual Event Bus Sim"}
            </h2>
          </div>
          
          <div className="text-xs text-slate-500 flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Security Zone: CA-CENTRAL-1</span>
          </div>
        </header>

        {/* Tab content view router */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {activeTab === "executive" && (
            <ExecutiveDashboard 
              stateData={stateData} 
              onSelectMsisdn={handleSelectMsisdn} 
              onSimulateEvent={handleSimulateEvent}
            />
          )}
          {activeTab === "operations" && (
            <OperationsConsole 
              stateData={stateData} 
              eventLogs={eventLogs} 
              onToggleSimulation={handleToggleSimulation} 
              onSimulationSpeedChange={handleSimulationSpeedChange} 
            />
          )}
          {activeTab === "data" && (
            <DataPlatformConsole 
              stateData={stateData} 
              entityDetails={entityDetails} 
              onRescore={handleRescore} 
            />
          )}
          {activeTab === "medallion_architecture" && (
            <MedallionArchitectureConsole />
          )}
          {activeTab === "data_exchange" && (
            <DataExchangeConsole />
          )}
          {activeTab === "dq" && (
            <DQMonitoringConsole stateData={stateData} />
          )}
          {activeTab === "ml" && (
            <MLPlatformConsole 
              stateData={stateData} 
              onPromoteModel={handlePromoteModel} 
              onRollbackModel={handleRollbackModel} 
              onTrainModel={handleTrainModel} 
            />
          )}
          {activeTab === "investigation" && (
            <FraudInvestigationConsole 
              entityDetails={entityDetails} 
              searchMsisdn={searchMsisdn} 
              onSearchChange={setSearchMsisdn} 
              onSearchSubmit={handleSearchSubmit} 
              onRescore={handleRescore} 
              rescoreLoading={rescoreLoading} 
              onQueryMsisdn={(num) => {
                setSearchMsisdn(num);
                fetchEntityDetails(num);
              }}
            />
          )}
          {activeTab === "realtime" && (
            <RealTimeMonitor 
              onSimulateEvent={handleSimulateEvent} 
            />
          )}
          {activeTab === "architecture" && (
            <TechnicalArchitecture />
          )}
        </div>
      </main>

    </div>
  );
}
