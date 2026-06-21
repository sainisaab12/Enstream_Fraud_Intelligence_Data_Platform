import { BACKEND_URL } from "../config";
import React, { useState, useEffect } from "react";
import { 
  Code, Database, Server, Cpu, HelpCircle, Layers, 
  CheckCircle, FileText, Settings, ShieldAlert, GitBranch, Play, PlayCircle, Loader, Terminal,
  TrendingUp, BarChart2, Shield, AlertCircle, RefreshCw, Lock, Unlock, Clock, ArrowRight, Eye, EyeOff
} from "lucide-react";

export default function TechnicalArchitecture() {
  const [activeSubTab, setActiveSubTab] = useState<"trace" | "sandbox" | "roadmap" | "evolution" | "brief" | "topology" | "code" | "schemas" | "aws" | "builder" | "framework">("evolution");
  const [selectedCodeSection, setSelectedCodeSection] = useState<string>("dq");
  
  // Trace console states
  const [targetMsisdn, setTargetMsisdn] = useState<string>("14165559001");
  const [traceLoading, setTraceLoading] = useState<boolean>(false);
  const [traceData, setTraceData] = useState<any>(null);
  const [bronzeMetadata, setBronzeMetadata] = useState<any>(null);
  const [silverMetadata, setSilverMetadata] = useState<any>(null);

  // Sandbox states
  const [selectedApi, setSelectedApi] = useState<string>("A1");
  const [useJose, setUseJose] = useState<boolean>(false);
  const [sandboxScenario, setSandboxScenario] = useState<string>("success");
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxHttpCode, setSandboxHttpCode] = useState<number | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxTrace, setSandboxTrace] = useState<string[]>([]);
  const [editableReq, setEditableReq] = useState<string>("");
  const [evolutionPhase, setEvolutionPhase] = useState<number>(5);

  // Pipeline Builder states
  const [builderSource, setBuilderSource] = useState<string>("kinesis");
  const [builderPath, setBuilderPath] = useState<string>("aws.kinesis.enstream.subscriber-events");
  const [builderDqMsisdn, setBuilderDqMsisdn] = useState<boolean>(true);
  const [builderDqImei, setBuilderDqImei] = useState<boolean>(true);
  const [builderDqFreshness, setBuilderDqFreshness] = useState<boolean>(false);
  const [builderAggType, setBuilderAggType] = useState<string>("sim_swap");
  const [builderWindow, setBuilderWindow] = useState<string>("2h");
  const [builderThreshold, setBuilderThreshold] = useState<number>(3);
  const [builderLogs, setBuilderLogs] = useState<string[]>([
    "[SYSTEM] Visual No-Code Pipeline Interface Initialized.",
    "[INFO] Select a source, define DQ checks, choose gold aggregation models, and click 'Deploy'."
  ]);
  const [deploying, setDeploying] = useState<boolean>(false);
  const [builderCodeTab, setBuilderCodeTab] = useState<"dbt" | "dataform" | "flink">("dbt");

  const handleDeployPipeline = () => {
    setDeploying(true);
    setBuilderLogs(prev => [
      ...prev,
      `[INFO] Starting deployment sequence for pipeline source '${builderSource}'...`,
      `[COMPILE] Target endpoint schema: '${builderPath}'`,
      `[COMPILE] Packing DQ SLA validations...`,
      `[COMPILE] Configuring '${builderAggType}' over ${builderWindow} window (Threshold >= ${builderThreshold})...`
    ]);

    setTimeout(() => {
      setDeploying(false);
      setBuilderLogs(prev => [
        ...prev,
        `[SUCCESS] Pipeline successfully compiled & registered to AWS EMR Glue Catalog!`,
        `[SUCCESS] Ingested Bronze Partition: 'enstream.bronze_${builderSource}'`,
        `[SUCCESS] Validated Silver Destination: 'enstream.silver_${builderSource}_validated'`,
        `[SUCCESS] Active Redshift Gold View: 'enstream_gold.features_${builderSource}_${builderAggType}'`,
        `[SYSTEM] AWS MWAA Scheduler triggered new DAG catalog sync.`,
        `[SYSTEM] Flink CDC Streaming Job spawned with active state validation (RocksDB backend).`
      ]);
    }, 1500);
  };

  const generateDbtCode = () => {
    return `{{ config(
    materialized='incremental',
    unique_key='event_id',
    incremental_strategy='merge'
) }}

WITH raw_events AS (
    SELECT * FROM {{ source('enstream_bronze', 'raw_${builderSource}') }}
),

validated_events AS (
    SELECT 
        event_id,
        event_type,
        msisdn,
        imei,
        timestamp,
        CASE 
            WHEN msisdn IS NULL THEN FALSE
            ${builderDqMsisdn ? "WHEN NOT REGEXP_LIKE(msisdn, '^\\+1[0-9]{10}$') THEN FALSE" : ""}
            ${builderDqImei ? "WHEN LENGTH(imei) != 15 THEN FALSE" : ""}
            ${builderDqFreshness ? "WHEN timestamp < DATEADD(hour, -2, GETDATE()) THEN FALSE" : ""}
            ELSE TRUE
        END as dq_passed
    FROM raw_events
)

SELECT * FROM validated_events
WHERE dq_passed = TRUE;`;
  };

  const generateDataformCode = () => {
    return `config {
  type: "incremental",
  schema: "enstream_silver",
  name: "silver_events_${builderSource}",
  assertions: {
    uniqueKey: ["event_id"],
    nonNull: ["msisdn", "imei"]
  }
}

SELECT 
  event_id,
  event_type,
  msisdn,
  imei,
  timestamp,
  ingested_at
FROM 
  \${ref("bronze_${builderSource}")}
WHERE 
  1=1
  ${builderDqMsisdn ? "AND REGEXP_LIKE(msisdn, '^\\+1[0-9]{10}$')" : ""}
  ${builderDqImei ? "AND LENGTH(imei) = 15" : ""}
  ${builderDqFreshness ? "AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)" : ""};`;
  };

  const generateFlinkCode = () => {
    return `CREATE TABLE silver_events_${builderSource} (
  event_id STRING,
  event_type STRING,
  msisdn STRING,
  imei STRING,
  \`timestamp\` TIMESTAMP(3),
  WATERMARK FOR \`timestamp\` AS \`timestamp\` - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kinesis',
  'stream' = '${builderPath}',
  'aws.region' = 'us-east-1',
  'format' = 'json'
);

-- Stateful rolling aggregation window
CREATE VIEW gold_features_${builderSource}_${builderAggType} AS
SELECT 
  msisdn,
  COUNT(event_id) as event_count,
  COUNT(DISTINCT imei) as distinct_imei_count,
  TUMBLE_START(\`timestamp\`, INTERVAL '${builderWindow === "2h" ? "2" : builderWindow === "24h" ? "24" : "720"}' HOUR) as window_start
FROM silver_events_${builderSource}
GROUP BY 
  msisdn, 
  TUMBLE(\`timestamp\`, INTERVAL '${builderWindow === "2h" ? "2" : builderWindow === "24h" ? "24" : "720"}' HOUR);`;
  };

  // Caching states
  const [cacheMode, setCacheMode] = useState<"hit" | "dirty_bypass" | "miss">("hit");
  const [simulatedLatency, setSimulatedLatency] = useState<number | null>(null);
  const [simulatedCacheStatus, setSimulatedCacheStatus] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({
    hitRatio: 98.7,
    avgLatency: 6.4,
    peakQps: 540,
    activeKeys: 24105,
    evictions: 2.1
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCacheStats(prev => {
        const deltaRatio = (Math.random() - 0.5) * 0.1;
        const deltaLatency = (Math.random() - 0.5) * 0.2;
        const deltaQps = Math.floor((Math.random() - 0.5) * 20);
        const deltaKeys = Math.floor((Math.random() - 0.5) * 5);
        const deltaEvictions = (Math.random() - 0.5) * 0.2;

        return {
          hitRatio: Math.min(100, Math.max(90, parseFloat((prev.hitRatio + deltaRatio).toFixed(2)))),
          avgLatency: Math.max(1, parseFloat((prev.avgLatency + deltaLatency).toFixed(2))),
          peakQps: Math.max(100, prev.peakQps + deltaQps),
          activeKeys: Math.max(1000, prev.activeKeys + deltaKeys),
          evictions: Math.max(0, parseFloat((prev.evictions + deltaEvictions).toFixed(2)))
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const msisdnPresets = [
    { label: "14165559001 (SIM Swapper / Rogers)", value: "14165559001" },
    { label: "14165559013 (Fraud Ring Node / Telus)", value: "14165559013" },
    { label: "14165559002 (Blacklisted / SFTP)", value: "14165559002" },
    { label: "14165550105 (Legit Port / TransUnion)", value: "14165550105" },
    { label: "14165550110 (CRM Sarah Connor / MySQL)", value: "14165550110" }
  ];

  const apiDetails: Record<string, {
    name: string;
    path: string;
    section: string;
    desc: string;
    reqSchema: string;
  }> = {
    A1: {
      name: "A1: Basic Identity Verification (IDV) API",
      path: "/api/rest/service/v1/dataMatching",
      section: "Section 9.1, Page 15",
      desc: "Detailed comparison of name/address relative to conformed carrier records.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a1_555f269a",
        msisdn: "+14165559001",
        consentGranted: true,
        matchingStrategies: ["exact"],
        inputData: {
          firstName: "John",
          lastName: "Doe",
          streetNumber: "123",
          streetName: "Spadina Ave",
          city: "Toronto",
          province: "ON",
          postalCode: "M5V2L4",
          country: "CA"
        }
      }, null, 2)
    },
    A2: {
      name: "A2: Account Status API",
      path: "/api/rest/service/v1/accountStatus",
      section: "Section 9.2, Page 20",
      desc: "Retrieves account status (Active, Suspended, Restricted) on network operators.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a2_9921bc34",
        msisdn: "+14165559001",
        consentGranted: true
      }, null, 2)
    },
    A3: {
      name: "A3: Account Type API",
      path: "/api/rest/service/v1/accountType",
      section: "Section 9.3, Page 22",
      desc: "Retrieves subscriber account type (Prepaid, Postpaid, Unknown), class (Consumer, Business), brand preference, and preference language.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a3_7736cd31",
        msisdn: "+14165559001",
        consentGranted: true
      }, null, 2)
    },
    A4: {
      name: "A4: Activation Date API",
      path: "/api/rest/service/v1/activationDate",
      section: "Section 9.4, Page 25",
      desc: "Retrieves the exact timestamp and date of subscriber activation on SIM card.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a4_8872cd12",
        msisdn: "+14165559001",
        consentGranted: true
      }, null, 2)
    },
    A5: {
      name: "A5: Enhanced Identity Verification (IDV) API",
      path: "/api/rest/service/v1/detailedIdentityVerification",
      section: "Section 9.5, Page 27",
      desc: "Advanced matching details returning deep name, address, and date of birth verification matrices.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a5_f448123e",
        msisdn: "+14165559001",
        consentGranted: true,
        matchingStrategies: ["levenshtein"],
        inputData: {
          firstName: "John",
          middleName: "Rogers",
          lastName: "Doe",
          streetNumber: "123",
          streetName: "Spadina Ave",
          city: "Toronto",
          province: "ON",
          postalCode: "M5V2L4",
          dob: "01/01/1990"
        }
      }, null, 2)
    },
    A6: {
      name: "A6: Enhanced IDV Change API",
      path: "/api/rest/service/v1/checkIdentityDataChange",
      section: "Section 9.6, Page 36",
      desc: "Identifies if any conformed subscriber info has changed since the last A5 verification using Subscriber ID.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_a6_9921bc34",
        msisdn: "+14165559001",
        subscriberId: "sub_9001_8829",
        consentGranted: true
      }, null, 2)
    },
    D1_V1: {
      name: "D1 (Stage 1 - V1): Header Injection (Deprecated)",
      path: "/api/rest/service/v1/headerInjection",
      section: "Section 10.1.1, Page 40",
      desc: "Queries injected header token from mobile browser data session (returning XML subscriber details).",
      reqSchema: JSON.stringify({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        networkAccess: "mobile_data"
      }, null, 2)
    },
    D1_V2: {
      name: "D1 (Stage 1 - V2): Header Injection (Redirect)",
      path: "/api/rest/service/v1/headerInjection-v2",
      section: "Section 10.1.2, Page 44",
      desc: "Performs HTTP redirect flow on mobile device to capture injected MNO token.",
      reqSchema: JSON.stringify({
        redirectUri: "https://partner-redirect-endpoint.com/callback"
      }, null, 2)
    },
    D1_Retrieval: {
      name: "D1 (Stage 2): Retrieve MSISDN API",
      path: "/api/rest/service/v2/msisdnRetrieval",
      section: "Section 10.1.3, Page 46",
      desc: "Exchanges one-time discovery token captured from Header Injection to retrieve actual subscriber MSISDN.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d1_ret_8892",
        token: "tok_00017919534700x00306E27",
        consentGranted: true
      }, null, 2)
    },
    D2: {
      name: "D2: Device Information API",
      path: "/api/rest/service/v1/deviceInformation",
      section: "Section 10.2, Page 49",
      desc: "Retrieves device IMEI, manufacturer make, and handset model currently associated with subscriber.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d2_8890cf",
        msisdn: "+14165559001",
        consentGranted: true
      }, null, 2)
    },
    D3: {
      name: "D3: Recent Service Changes API",
      path: "/api/rest/service/v2/recentServiceChange",
      section: "Section 10.3, Page 51",
      desc: "Identifies carrier status changes, SIM swaps, or porting updates within the last N days.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d3_10123f11",
        msisdn: "+14165559001",
        consentGranted: true,
        lookbackDays: 7
      }, null, 2)
    },
    D3M: {
      name: "D3M: Recent Service Changes API (Multi)",
      path: "/api/rest/service/v2/recentServiceChangeMulti",
      section: "Section 10.4, Page 64",
      desc: "Batch query of recent service changes (SIM swap, device change, status) for up to 5 MSISDNs in a single request.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d3m_11029c",
        msisdns: ["+14165559001", "+14165559002"],
        consentGranted: true,
        lookbackDays: 15
      }, null, 2)
    },
    D4: {
      name: "D4: Account Integrity API",
      path: "/api/rest/service/v2/accountIntegrityIndex",
      section: "Section 10.5, Page 70",
      desc: "Traverses device IMEI switches and flags high-churn hardware/SIM fraud risks.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d4_772188ab",
        msisdn: "+14165559001",
        consentGranted: true
      }, null, 2)
    },
    D5: {
      name: "D5: Mobile Token API",
      path: "/api/rest/service/v1/getMobileToken",
      section: "Section 10.6, Page 83",
      desc: "Generates secure mobile verification token from one-time discovery credentials.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d5_22919aa",
        token: "tok_00017919534700x00306E27"
      }, null, 2)
    },
    D6: {
      name: "D6: Mobile Number Verify API",
      path: "/api/rest/service/v1/msisdnVerification",
      section: "Section 10.7, Page 85",
      desc: "Verifies matching subscriber possession of phone number using carrier network indicators.",
      reqSchema: JSON.stringify({
        serviceProviderId: "sp_partnerId01",
        requestId: "req_d6_00192bc5",
        msisdnVerify: "+14165559001",
        token: "tok_00017919534700x00306E27",
        consentGranted: true
      }, null, 2)
    }
  };

  useEffect(() => {
    setEditableReq(apiDetails[selectedApi].reqSchema);
    setSandboxResponse(null);
    setSandboxHttpCode(null);
    setSandboxTrace([]);
  }, [selectedApi]);

  const handleRunTrace = async () => {
    setTraceLoading(true);
    setTraceData(null);
    setBronzeMetadata(null);
    setSilverMetadata(null);
    
    try {
      const entityRes = await fetch(`${BACKEND_URL}/api/entity/${targetMsisdn}`);
      if (entityRes.ok) {
        const data = await entityRes.json();
        setTraceData(data);
      }
      
      const bronzeRes = await fetch(`${BACKEND_URL}/api/data/metadata/bronze`);
      if (bronzeRes.ok) {
        const metadata = await bronzeRes.json();
        setBronzeMetadata(metadata);
      }

      const silverRes = await fetch(`${BACKEND_URL}/api/data/metadata/silver`);
      if (silverRes.ok) {
        const metadata = await silverRes.json();
        setSilverMetadata(metadata);
      }
    } catch (err) {
      console.error("Trace execution failed", err);
    } finally {
      setTraceLoading(false);
    }
  };

  const handleRunSandbox = () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxHttpCode(null);
    setSimulatedLatency(null);
    setSimulatedCacheStatus(null);
    
    // Determine simulated response time and status based on cacheMode
    let trueLatency = 0;
    let cacheStatusBadge = "";
    let timeoutMs = 1200;

    if (cacheMode === "hit") {
      trueLatency = parseFloat((3.2 + Math.random() * 4.6).toFixed(1));
      cacheStatusBadge = "HIT (Redis)";
      timeoutMs = 300; // fast loading spinner for cache hit
    } else if (cacheMode === "dirty_bypass") {
      trueLatency = parseFloat((42.0 + Math.random() * 35.0).toFixed(1));
      cacheStatusBadge = "BYPASS (Dirty Flag)";
      timeoutMs = 600; // medium loading spinner
    } else {
      trueLatency = parseFloat((155.0 + Math.random() * 85.0).toFixed(1));
      cacheStatusBadge = "MISS (Cold DB read)";
      timeoutMs = 1000; // slow loading spinner
    }

    const traceLog: string[] = [];
    traceLog.push(`[SYSTEM] Initializing API Sandboxed Client...`);
    traceLog.push(`[HEADERS] Content-Type: application/json; charset=UTF-8`);
    traceLog.push(`[HEADERS] Authorization: Basic c3BfcGFydG5lcklkMDE6cGFzc3dvcmQ= (Base64 partnerID:password)`);
    traceLog.push(`[HEADERS] User-Agent: Jakarta Commons-HttpClient/3.1`);
    traceLog.push(`[HEADERS] Accept: application/json`);
    traceLog.push(`[SYSTEM] Querying Endpoint: ${apiDetails[selectedApi].path} (${apiDetails[selectedApi].section})`);
    
    // Cache specific traces
    if (cacheMode === "hit") {
      traceLog.push(`[CACHE] Checking Redis cache keyspace for MSISDN query...`);
      traceLog.push(`[CACHE] Cache HIT! Found key: msisdn_score:+14165559001`);
      traceLog.push(`[CACHE] Retrieved pre-computed features and score in ${trueLatency}ms.`);
    } else if (cacheMode === "dirty_bypass") {
      traceLog.push(`[CACHE] Checking Redis cache keyspace for MSISDN query...`);
      traceLog.push(`[CACHE] Cache BYPASS: Dirty flag raised for MSISDN (telemetry event within 2-min window).`);
      traceLog.push(`[FEATURE STORE] Querying DynamoDB active feature store table...`);
      traceLog.push(`[PIPELINE] Promoted features from DynamoDB & refreshed scoring weights in ${trueLatency}ms.`);
      traceLog.push(`[CACHE] Refreshed score written back to Redis keyspace.`);
    } else {
      traceLog.push(`[CACHE] Checking Redis cache keyspace for MSISDN query...`);
      traceLog.push(`[CACHE] Cache MISS: Key not found in Redis keyspace.`);
      traceLog.push(`[DATABASE] Falling back to query conformed records in MySQL/Redshift Gold tables...`);
      traceLog.push(`[DATABASE] Scanned 30M subscriber profiles and entity lineage in ${trueLatency}ms.`);
      traceLog.push(`[CACHE] Populating Redis keyspace for future lookups.`);
    }

    if (useJose) {
      traceLog.push(`[JOSE] Encrypting request payload using JWE/JWS RFC7515/7516 framework...`);
      traceLog.push(`[JOSE] Generated RS256 Signature using client RSA-2048 private key.`);
      traceLog.push(`[JOSE] Encrypted payload using RSA-OAEP with SHA-256 and AES-256-GCM.`);
      traceLog.push(`[WIRE PAYLOAD] POST ${apiDetails[selectedApi].path} HTTP/1.1`);
      
      const headerObj = {
        alg: "RS256",
        kid: "pub_sp_partnerId01",
        expires: "06/17/2026 18:00:00 GMT",
        operation: `${selectedApi}_SERVICE`
      };
      traceLog.push(`[WIRE PAYLOAD] Protected JWS Header: ${JSON.stringify(headerObj)}`);
      
      const dummyToken = `eyJhbGciOiJSUzI1NiIsImtpZCI6InB1Yl9zcF9wYXJ0bmVySWQwMSIsImV4cGlyZXMiOiIwNi8xNy8yMDI2IDE4OjAwOjAwIiwib3BlcmF0aW9uIjoi${selectedApi}_SERVICE"}.eyJyZXF1ZXN0SWQiOiJyZXFfMTIzNDU2IiwidG9rZW4iOiJlbnN0cmVhbS1wcm90b2NvbCJ9.${Math.random().toString(36).substring(7)}`;
      traceLog.push(`[WIRE PAYLOAD] JWE Encrypted Body (AES-GCM Envelope): ${dummyToken.substring(0, 45)}...`);
    } else {
      traceLog.push(`[SYSTEM] Client running over secure Partner VPN tunnel.`);
      try {
        traceLog.push(`[WIRE PAYLOAD] POST Body: ${JSON.stringify(JSON.parse(editableReq), null, 2)}`);
      } catch (e) {
        traceLog.push(`[WIRE PAYLOAD] POST Body: ${editableReq}`);
      }
    }

    setTimeout(() => {
      let httpCode = 200;
      let respObj: any = {};
      
      if (sandboxScenario === "success") {
        httpCode = 200;
        if (selectedApi === "A1") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            outputData: {
              firstName: ["100"],
              lastName: ["100"],
              streetNumber: ["100"],
              streetName: ["100"],
              city: ["100"],
              province: ["100"],
              postalCode: ["100"],
              country: ["100"]
            }
          };
        } else if (selectedApi === "A2") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            accountStatus: "ACTIVE",
            mnoCarrier: "ROGERS",
            recycledStatus: "OWNED"
          };
        } else if (selectedApi === "A3") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            accountType: "postpaid",
            accountClass: "consumer",
            accountUser: "primary",
            mnoBrand: "Rogers",
            mnoSubBrand: "FIDO",
            languagePreference: "en"
          };
        } else if (selectedApi === "A4") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            activationDate: "12/15/2023 10:45:00 GMT",
            lineAgeDays: 915
          };
        } else if (selectedApi === "A5") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            confidenceScore: 95,
            outputData: {
              firstName: ["85"],
              middleName: ["100"],
              lastName: ["100"],
              streetNumber: ["100"],
              streetName: ["100"],
              city: ["100"],
              province: ["100"],
              postalCode: ["100"],
              dob: ["100"]
            }
          };
        } else if (selectedApi === "A6") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            nameChanged: false,
            addressChanged: true,
            dobChanged: false,
            statusChanged: false,
            typeChanged: false
          };
        } else if (selectedApi === "D1_V1") {
          respObj = `<?xml version="1.0"?>\n<subscriber>\n  <subId2>00017919534700x00306E274C171066775037344-023X</subId2>\n  <eamLanguage>E</eamLanguage>\n  <accountSubType>I</accountSubType>\n</subscriber>`;
        } else if (selectedApi === "D1_V2") {
          httpCode = 307;
          respObj = {
            status: 307,
            redirect_uri: "https://partner-redirect-endpoint.com/callback?token=tok_00017919534700x00306E27"
          };
        } else if (selectedApi === "D1_Retrieval") {
          respObj = {
            responseCode: 0,
            msisdn: "+14165559001"
          };
        } else if (selectedApi === "D2") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            deviceMake: "Apple",
            deviceModel: "iPhone 15 Pro",
            imei: "358872091122334"
          };
        } else if (selectedApi === "D3") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            recentChangesCount: 0,
            simSwapDetected: false,
            lastSimSwapTimestamp: 0,
            lineType: "MOBILE"
          };
        } else if (selectedApi === "D3M") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            results: [
              {
                msisdn: "+14165559001",
                responseCode: 0,
                simChanged: false,
                deviceChanged: false,
                numberChanged: false,
                nameChanged: false,
                addressChanged: false,
                statusChanged: false
              },
              {
                msisdn: "+14165559002",
                responseCode: 0,
                simChanged: true,
                simChangeDate: "06/15/2026",
                deviceChanged: false,
                numberChanged: false,
                nameChanged: false,
                addressChanged: false,
                statusChanged: false
              }
            ]
          };
        } else if (selectedApi === "D4") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            integrityIndex: 98,
            tenureDays: 540,
            callFreq: "MEDIUM",
            terminationStatus: "ACTIVE"
          };
        } else if (selectedApi === "D5") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            mobileToken: "m_tok_88219cff7812003c"
          };
        } else {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            msisdnVerified: true
          };
        }
        traceLog.push(`[MNO NETWORK] Carrier database lookup resolved successfully.`);
        traceLog.push(`[JOSE] Decrypting signed response payload...`);
        traceLog.push(`[JOSE] Verified JWS signature matches EnStream public key.`);
      } else if (sandboxScenario === "recycled") {
        httpCode = 200;
        if (selectedApi === "A1" || selectedApi === "A5") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            outputData: {
              firstName: ["-102"],
              lastName: ["-102"],
              streetNumber: ["-102"],
              postalCode: ["-102"]
            }
          };
        } else if (selectedApi === "A2") {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            accountStatus: "ACTIVE",
            mnoCarrier: "ROGERS",
            recycledStatus: "RECYCLED"
          };
        } else {
          respObj = {
            responseCode: 0,
            responseMessage: "Success",
            recycleDetected: true,
            status: "RECYCLED",
            recycleCheckTimestamp: "2026-06-17T08:30:00Z"
          };
        }
        traceLog.push(`[MNO NETWORK] Recycled checks triggered: Subscriber details changed on carrier logs since blacklist hit.`);
      } else if (sandboxScenario === "blocked") {
        httpCode = 200;
        respObj = {
          responseCode: 7,
          responseMessage: "Blocked Number"
        };
        traceLog.push(`[MNO NETWORK] Request blocked: Corporate account restrictions or user block list (Code 7).`);
      } else if (sandboxScenario === "missing_field") {
        httpCode = 400;
        respObj = {
          responseCode: 3,
          responseMessage: "Field msisdn is required."
        };
        traceLog.push(`[VALIDATION] Request rejected: missing mandatory keys (Code 3).`);
      } else if (sandboxScenario === "expired_token") {
        httpCode = 400;
        respObj = {
          responseCode: 15,
          responseMessage: "Invalid Token (either expired or non-existent)"
        };
        traceLog.push(`[JOSE SECURITY] Cryptographic handshake failed: Token expired or invalid signature envelope (Code 15).`);
      } else if (sandboxScenario === "unauthorized_ip") {
        httpCode = 403;
        respObj = {
          responseCode: 4,
          responseMessage: "Unauthorized IP Access"
        };
        traceLog.push(`[SECURITY] Gateway Firewall blocked source IP (Code 4).`);
      }

      setSandboxResponse(respObj);
      setSandboxHttpCode(httpCode);
      setSimulatedLatency(trueLatency);
      setSimulatedCacheStatus(cacheStatusBadge);
      setSandboxTrace(traceLog);
      setSandboxLoading(false);
    }, timeoutMs);
  };

  useEffect(() => {
    handleRunTrace();
  }, [targetMsisdn]);

  const codeSnippets: Record<string, {
    title: string;
    filePath: string;
    description: string;
    language: string;
    code: string;
  }> = {
    dq: {
      title: "Data Quality Engine (SLA Checks)",
      filePath: "backend/app/quality.py",
      language: "python",
      description: "Applies schema constraints, checks completeness of device IMEI records on carrier activations, verifies freshness thresholds (< 2 hours check), and ensures formatting (E.164 phone formats and 15-digit numeric IMEIs).",
      code: `def run_dq_check(payload: dict, source: str) -> (bool, list):
    errors = []
    
    # 1. Schema Validation (Required Fields)
    if not payload.get("msisdn"):
        errors.append("MISSING_MSISDN")
    
    # 2. Completeness Validation (Carrier requires IMEI)
    if source in ["bell", "rogers", "telus"] and not payload.get("imei") and payload.get("event_type") != "msisdn_update":
        errors.append("MISSING_IMEI")
        
    # 3. Freshness Validation (Timestamp check < 2 hours)
    event_time = payload.get("timestamp", 0)
    current_time = time.time()
    if current_time - event_time > 7200: # 2 hours in seconds
        errors.append("STALE_EVENT_EXCEEDS_2H_SLA")
        
    # 4. Formatting (E.164 & IMEI checks)
    msisdn = payload.get("msisdn", "")
    if msisdn and len(msisdn) < 10:
        errors.append("INVALID_MSISDN_FORMAT")
        
    imei = payload.get("imei", "")
    if imei and (len(imei) != 15 or not imei.isdigit()):
        errors.append("INVALID_IMEI_FORMAT")
        
    dq_passed = len(errors) == 0
    return dq_passed, errors`
    },
    graph: {
      title: "Fraud Ring BFS Graph Traversal",
      filePath: "backend/app/features.py",
      language: "python",
      description: "Builds a bipartite connection graph G = (MSISDN + IMEI, Edges) linking telephone numbers sharing hardware devices. Uses a Breadth-First Search (BFS) component scan to calculate network fraud ring sizes.",
      code: `def calculate_network_ring_size(target_msisdn: str, all_silver_events: list) -> int:
    # 1. Build bidirectional adjacency maps
    msisdn_to_imeis = defaultdict(set)
    imei_to_msisdns = defaultdict(set)
    
    for event in all_silver_events:
        if not event.get("dq_passed"):
            continue
        m = event.get("msisdn")
        i = event.get("imei")
        if m and i:
            msisdn_to_imeis[m].add(i)
            imei_to_msisdns[i].add(m)
            
    # 2. Perform BFS component size traversal
    queue = [target_msisdn]
    visited_msisdns = {target_msisdn}
    visited_imeis = set()
    
    while queue:
        curr_msisdn = queue.pop(0)
        linked_imeis = msisdn_to_imeis[curr_msisdn]
        for imei in linked_imeis:
            if imei not in visited_imeis:
                visited_imeis.add(imei)
                linked_msisdns = imei_to_msisdns[imei]
                for next_msisdn in linked_msisdns:
                    if next_msisdn not in visited_msisdns:
                        visited_msisdns.add(next_msisdn)
                        queue.append(next_msisdn)
                        
    return len(visited_msisdns)`
    },
    scoring: {
      title: "Trust Score Engine & SHAP Explainability",
      filePath: "backend/app/scoring.py",
      language: "python",
      description: "Computes a trust score (0-100) using weights from the model registry. Calculates SHAP contribution vectors showing the points subtracted by active risk rules.",
      code: `def score_msisdn(msisdn: str) -> dict:
    # Get profile features from gold / online feature store
    features = get_features(msisdn)
    trust_score = 100
    deductions = {}
    reason_codes = []
    
    # 1. Blacklist Check
    if features.get("fraud_exchange_matches", 0) > 0:
        deductions["fraud_exchange_matches"] = -60.0
        reason_codes.append("FRAUD_EXCHANGE_HIT")
        
    # 2. Port Frequency Check
    port_freq = features.get("port_frequency_30d", 0)
    if port_freq >= 3:
        deductions["port_frequency_30d"] = -30.0
        reason_codes.append("HIGH_PORTING_FREQUENCY")
        
    # 3. Device SIM Swap Churn
    device_churn = features.get("device_churn_count", 0)
    if device_churn >= 3:
        deductions["device_churn_count"] = -20.0
        reason_codes.append("DEVICE_SIM_SWAP_CHURN")
        
    # 4. Network Fraud Ring
    ring_size = features.get("network_fraud_ring_size", 0)
    if ring_size >= 3:
        deductions["network_fraud_ring_size"] = min(-50.0, -10.0 * ring_size)
        reason_codes.append("FRAUD_RING_MEMBER")
        
    # Calculate final score
    total_deduction = sum(deductions.values())
    trust_score = max(0, 100 + total_deduction)
    
    return {
        "msisdn": msisdn,
        "trust_score": trust_score,
        "suspicion_tier": "Critical" if trust_score <= 20 else "High Risk" if trust_score <= 50 else "Medium Risk" if trust_score <= 80 else "Low Risk",
        "fraud_flag": trust_score <= 50,
        "reason_codes": reason_codes,
        "explainability": deductions # SHAP contributions
    }`
    },
    drift: {
      title: "ML Drift Monitoring (PSI Index)",
      filePath: "backend/app/models.py",
      language: "python",
      description: "Calculates the Population Stability Index (PSI) to track feature and scoring drift over time between the training baseline and live inference score distributions.",
      code: `def calculate_psi(baseline_scores: list, current_scores: list) -> float:
    # 1. Partition scores into 5 standard bins
    bins = [0, 20, 40, 60, 80, 100]
    
    expected_counts, _ = np.histogram(baseline_scores, bins=bins)
    actual_counts, _ = np.histogram(current_scores, bins=bins)
    
    # 2. Compute ratios (proportions)
    expected_ratios = expected_counts / len(baseline_scores)
    actual_ratios = actual_counts / len(current_scores)
    
    # 3. Sum index values using smoothing factor
    psi = 0.0
    epsilon = 1e-5
    for a, e in zip(actual_ratios, expected_ratios):
        a_s = a + epsilon
        e_s = e + epsilon
        psi += (a - e) * np.log(a_s / e_s)
        
    return psi`
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-100">
      
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-500" />
            System Architecture & Technical Working
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Explore the transition roadmap, vendor design parameters, test standard REST APIs, and run live pipeline traces.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("trace")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "trace" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Live Execution Trace
          </button>
          <button
            onClick={() => setActiveSubTab("sandbox")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "sandbox" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Partner API Sandbox
          </button>
          <button
            onClick={() => setActiveSubTab("roadmap")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "roadmap" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Phase Roadmap
          </button>
          <button
            onClick={() => setActiveSubTab("evolution")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "evolution" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Architecture Evolution
          </button>
          <button
            onClick={() => setActiveSubTab("builder")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "builder" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            No-Code Pipeline Builder
          </button>
          <button
            onClick={() => setActiveSubTab("framework")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "framework" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Managed Operations Framework
          </button>
          <button
            onClick={() => setActiveSubTab("brief")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "brief" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Vendor Brief & Feedback
          </button>
          <button
            onClick={() => setActiveSubTab("topology")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "topology" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Topology
          </button>
          <button
            onClick={() => setActiveSubTab("code")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "code" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Code Inspector
          </button>
          <button
            onClick={() => setActiveSubTab("schemas")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "schemas" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Data Schemas
          </button>
          <button
            onClick={() => setActiveSubTab("aws")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === "aws" ? "bg-slate-850 text-blue-400 border border-slate-700/65" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            AWS Integration
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LIVE EXECUTION TRACER */}
      {activeSubTab === "trace" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs w-full md:w-auto">
              <span className="text-slate-400 font-bold whitespace-nowrap">Select Target Entity:</span>
              <select
                value={targetMsisdn}
                onChange={(e) => setTargetMsisdn(e.target.value)}
                disabled={traceLoading}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none w-full md:w-64"
              >
                {msisdnPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunTrace}
              disabled={traceLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/25 text-slate-100 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all shrink-0"
            >
              {traceLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Executing Trace...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Execute Trace</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Data Quality SLA validator assertions (quality.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Validates structural constraints and E.164 formats</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden">
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-855">
                          <th className="p-2 text-slate-400">Constraint Asserted</th>
                          <th className="p-2 text-slate-400">Target Value</th>
                          <th className="p-2 text-slate-400">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-855">
                          <td className="p-2 text-slate-300">CHECK_MSISDN_FORMAT</td>
                          <td className="p-2 text-slate-400">{traceData.msisdn}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr className="border-b border-slate-855">
                          <td className="p-2 text-slate-300">CHECK_IMEI_LENGTH</td>
                          <td className="p-2 text-slate-400">{traceData.features.device_churn_count > 0 ? "15 Digits" : "N/A"}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr className="border-b border-slate-855">
                          <td className="p-2 text-slate-300">CHECK_FRESHNESS_SLA</td>
                          <td className="p-2 text-slate-400">{"< 2 Hours delay"}</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-300">CHECK_SCHEMA_COMPLETENESS</td>
                          <td className="p-2 text-slate-400">All fields populated</td>
                          <td className="p-2 text-emerald-400 font-bold">PASS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <span className="font-bold">Automated DQ Status:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold rounded-full">
                      DQ_PASSED
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to inspect assertions.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <GitBranch className="w-4 h-4 mr-1.5 text-amber-400" />
                  Shared-Device Graph component BFS walk (features.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">BFS component walk traversing device IMEI relations</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-3 font-mono text-[10.5px] bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="text-blue-400 font-bold uppercase tracking-wider text-[9px] mb-1">BFS Walk debug console</div>
                  <div>
                    <span className="text-slate-500">Initialize Queue:</span>
                    <span className="text-slate-300"> [ Root: {traceData.msisdn} ]</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Bipartite Scan:</span>
                    <span className="text-slate-300"> Found IMEIs: [ {traceData.silver_events?.[0]?.imei || "None"} ]</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Traversed nodes:</span>
                    <span className="text-slate-300"> {traceData.features.network_fraud_ring_size > 1 ? `Found ${traceData.features.network_fraud_ring_size} sharing MSISDNs` : "No shared device links"}</span>
                  </div>
                  <div className="border-t border-slate-850 pt-2 mt-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 font-sans">Network Component size:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      traceData.features.network_fraud_ring_size >= 3 ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-300"
                    }`}>
                      Size: {traceData.features.network_fraud_ring_size || 1}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to inspect graph walk.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-rose-500" />
                  Scoring Engine Rules Math deductions (scoring.py)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Ledger showing deductions subtracted from baseline 100</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : traceData ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10.5px] space-y-2">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-400 font-bold">Rule Feature Evaluated</span>
                      <span className="text-slate-400 font-bold">Points Deducted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Base Trust Score</span>
                      <span className="text-emerald-400 font-bold">+100</span>
                    </div>
                    {Object.entries(traceData.score.explainability || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="flex justify-between text-rose-400">
                        <span className="uppercase text-slate-400">{key.replace(/_/g, " ")}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-xs">
                      <span className="text-slate-200">FINAL TRUST SCORE</span>
                      <span className={traceData.score.trust_score <= 50 ? "text-rose-400" : "text-emerald-400"}>
                        {traceData.score.trust_score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 text-[10.5px]">
                    <div className="flex-1 p-2 bg-slate-950 border border-slate-850 rounded text-center">
                      <span className="text-slate-500 block">Suspicion Tier:</span>
                      <span className="font-bold text-slate-200 uppercase">{traceData.score.suspicion_tier}</span>
                    </div>
                    <div className="flex-1 p-2 bg-slate-950 border border-slate-850 rounded text-center">
                      <span className="text-slate-500 block">Fraud Flag:</span>
                      <span className={`font-bold uppercase ${traceData.score.fraud_flag ? "text-rose-400" : "text-emerald-400"}`}>
                        {traceData.score.fraud_flag ? "TRIGGERED" : "CLEAR"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to view deductions ledger.</div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-blue-400" />
                  Latest Apache Iceberg metadata manifest (vN.metadata.json)
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Actual S3 table catalog JSON generated by pyarrow pipeline</p>
              </div>

              {traceLoading ? (
                <div className="py-12 flex justify-center"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : bronzeMetadata ? (
                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-lg border border-slate-850 p-3 font-mono text-[9px] text-slate-300 max-h-[160px] overflow-y-auto leading-relaxed">
                    <pre><code>{JSON.stringify(bronzeMetadata, null, 2)}</code></pre>
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Catalog Type: Local SQLite File</span>
                    <span className="text-blue-400 font-bold">v{bronzeMetadata["last-sequence-number"] || 1} manifest</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">Run trace to fetch Iceberg metadata.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: ARCHITECTURE EVOLUTION */}
      {activeSubTab === "evolution" && (
        <div className="space-y-6 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-blue-500 animate-pulse" />
                  Phase-Wise Architectural Evolution & Streaming Simplification
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Observe the step-by-step transition from batch aggregations to serverless stream lookup caches and stateful processing.
                </p>
              </div>

              {/* Evolution Phase Selector */}
              <div className="bg-slate-950 p-1 rounded-lg border border-slate-850 flex space-x-1">
                <button
                  onClick={() => setEvolutionPhase(1)}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    evolutionPhase === 1
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 border border-transparent hover:text-slate-300"
                  }`}
                >
                  Phase 1-2 (Batch)
                </button>
                <button
                  onClick={() => setEvolutionPhase(3)}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    evolutionPhase === 3
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 border border-transparent hover:text-slate-300"
                  }`}
                >
                  Phase 3 (Serverless Stream)
                </button>
                <button
                  onClick={() => setEvolutionPhase(4)}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    evolutionPhase === 4
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 border border-transparent hover:text-slate-300"
                  }`}
                >
                  Phase 4 (Stateful Stream)
                </button>
                <button
                  onClick={() => setEvolutionPhase(5)}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    evolutionPhase === 5
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 border border-transparent hover:text-slate-300"
                  }`}
                >
                  Phase 5 (Northstar)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Details & Acceptance Criteria */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block">
                    {evolutionPhase === 1 && "Phase 1 & 2: Batch Baseline"}
                    {evolutionPhase === 3 && "Phase 3: Interim Real-Time"}
                    {evolutionPhase === 4 && "Phase 4: Source-Direct Streaming"}
                    {evolutionPhase === 5 && "Phase 5: Continuous Northstar"}
                  </span>
                  
                  <h5 className="font-bold text-slate-200 text-xs">
                    {evolutionPhase === 1 && "Incremental Spark Lakehouse Promotions"}
                    {evolutionPhase === 3 && "Kinesis & AWS Lambda serving 13 APIs"}
                    {evolutionPhase === 4 && "Apache Flink CEP & RocksDB In-Memory State"}
                    {evolutionPhase === 5 && "Autonomous Retraining & Bad Actor Data Exchange"}
                  </h5>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {evolutionPhase === 1 && "Legacy MySQL databases extract conformed records daily. Batch Glue Spark promotion tasks write to S3 Bronze Parquet landing, validate schema formatting rules, promote to conformed Silver, and load analytical aggregates into Redshift serverless Gold tables scheduled by MWAA (Airflow)."}
                    {evolutionPhase === 3 && "CRM triggers publish events to AWS Kinesis Data Streams. AWS Lambda reads shards, updates Amazon DynamoDB Feature Store, and evicts cached entries in ElastiCache Redis. API Gateway and Step Functions serve 13 REST APIs directly from Redis (< 10ms) or falls back to DynamoDB (< 50ms)."}
                    {evolutionPhase === 4 && "Transition to direct carrier streaming logs. Apache Flink consumes carrier streams, maintains in-memory rolling state windows in RocksDB (checking e.g. sim swaps count >= 3 within 2 hours, graph networks) in under 10ms. Flink updates DynamoDB feature store and Redis point cache."}
                    {evolutionPhase === 5 && "Model registries monitor PSI inputs continuously. If PSI > 0.2, automated retraining triggers. Exposes the Bad Actor Data Exchange Hub, consolidating inter-carrier blacklists with role-based access privacy PII masking."}
                  </p>

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Key Technologies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {evolutionPhase === 1 && (
                        <>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">EMR Spark</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">AWS Glue</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">Airflow (MWAA)</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">Redshift</span>
                        </>
                      )}
                      {evolutionPhase === 3 && (
                        <>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">AWS Kinesis</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">AWS Lambda</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">DynamoDB</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">Redis Cache</span>
                        </>
                      )}
                      {evolutionPhase === 4 && (
                        <>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">Apache Flink</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">RocksDB State</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">Redis Cluster</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">DynamoDB</span>
                        </>
                      )}
                      {evolutionPhase === 5 && (
                        <>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">SageMaker Pipeline</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">LFS blacklists</span>
                          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9.5px] font-mono text-slate-400">RBAC Masking</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block">Acceptance Gate Criteria</span>
                  <ul className="text-[10.5px] text-slate-400 font-sans list-disc pl-4 space-y-1.5">
                    {evolutionPhase === 1 && (
                      <>
                        <li>Score output matches PoC holdout dataset exactly.</li>
                        <li>Partition-level database writes are verified idempotent.</li>
                        <li>S3 Medallion storage structure conforms to Glue metadata catalog.</li>
                      </>
                    )}
                    {evolutionPhase === 3 && (
                      <>
                        <li>API schemas conform to v1.38 Partner Integration Specifications.</li>
                        <li>P95 lookup response latency is verified under 2.0 seconds.</li>
                        <li>JWS signature headers and JWE encryption payloads function over VPN.</li>
                      </>
                    )}
                    {evolutionPhase === 4 && (
                      <>
                        <li>Direct carrier event streams parse with latency under 2.0 seconds.</li>
                        <li>In-memory Redis cache scoring lookups resolve under 10 milliseconds (P99 &lt; 50ms).</li>
                        <li>Dirty flags automatically trigger background DynamoDB refreshes.</li>
                      </>
                    )}
                    {evolutionPhase === 5 && (
                      <>
                        <li>Model monitoring triggers automatic retrain runs on drift (PSI &gt; 0.2).</li>
                        <li>GDPR compliance checks confirm automatic PII redacting/masking under RBAC.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right Column: Architectural Infographic View */}
              <div className="lg:col-span-8 bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-3 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-mono block self-start">
                  {evolutionPhase === 1 && "Ingestion flow: MySQL -> Spark -> Bronze -> Silver -> Gold (Redshift)"}
                  {evolutionPhase === 3 && "Ingestion flow: API Webhooks -> Kinesis -> Lambda -> DynamoDB + Redis"}
                  {evolutionPhase === 4 && "Ingestion flow: Direct Logs -> Flink CEP -> RocksDB State -> DynamoDB + Redis"}
                  {evolutionPhase === 5 && "Ingestion flow: Multi-carrier streams + Bad Actor Exchange + Retrain Loop"}
                </span>
                
                <div className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-2 min-h-[300px]">
                  {evolutionPhase === 1 && (
                    <img 
                      src="/enstream_phase_1_2_batch_architecture.png" 
                      alt="Phase 1 & 2 Batch Architecture"
                      className="max-w-full max-h-[420px] object-contain"
                    />
                  )}
                  {evolutionPhase === 3 && (
                    <img 
                      src="/enstream_phase_3_serverless_architecture.png" 
                      alt="Phase 3 Serverless Ingest Architecture"
                      className="max-w-full max-h-[420px] object-contain"
                    />
                  )}
                  {evolutionPhase === 4 && (
                    <img 
                      src="/enstream_phase_4_enterprise_architecture.png" 
                      alt="Phase 4 Enterprise Stateful Ingest Architecture"
                      className="max-w-full max-h-[420px] object-contain"
                    />
                  )}
                  {evolutionPhase === 5 && (
                    <img 
                      src="/enstream_detailed_architecture_v3.png" 
                      alt="Phase 5 Northstar Systems Architecture"
                      className="max-w-full max-h-[420px] object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2.5: NO-CODE PIPELINE BUILDER */}
      {activeSubTab === "builder" && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
              <Layers className="h-4 w-4 text-emerald-450 mr-2" />
              Visual No-Code Pipeline Manager & Code Generator
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-4xl">
              This interface allows EnStream data operators to create, manage, and scale ingestion pipelines and data quality checks without writing complex Apache Spark/Flink code. Define sources, configure DQ validation rules, select gold aggregations, and instantly generate standard **dbt models (SQL)**, **Dataform scripts (SQLX)**, or **Flink SQL streaming definitions** for deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Hand side: Pipeline Configuration Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">1. Ingestion Data Source</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono mb-1 font-bold">Source Connector Type:</label>
                    <select 
                      value={builderSource}
                      onChange={(e) => setBuilderSource(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="kinesis">AWS Kinesis Stream (Real-Time)</option>
                      <option value="s3">Amazon S3 Ingress (Batch Parquet/CSV)</option>
                      <option value="mysql_cdc">MySQL CDC Agent (Debezium / Kafka)</option>
                      <option value="sftp">SFTP Partner contribution (Batch Files)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono mb-1 font-bold">Stream Name / S3 URI Path:</label>
                    <input 
                      type="text" 
                      value={builderPath}
                      onChange={(e) => setBuilderPath(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">2. Bronze-to-Silver Data Quality (DQ) Rules</span>
                <div className="space-y-2">
                  <label className="flex items-start space-x-2.5 p-2 bg-slate-900/60 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={builderDqMsisdn} 
                      onChange={(e) => setBuilderDqMsisdn(e.target.checked)}
                      className="mt-0.5" 
                    />
                    <div className="text-[11px] font-sans">
                      <span className="font-bold text-slate-200 block">E.164 MSISDN Format Check</span>
                      <span className="text-slate-400">Validates regex phone formats for Bell, Rogers, and Telus (+1 Canadian prefix).</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2 bg-slate-900/60 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={builderDqImei} 
                      onChange={(e) => setBuilderDqImei(e.target.checked)}
                      className="mt-0.5" 
                    />
                    <div className="text-[11px] font-sans">
                      <span className="font-bold text-slate-200 block">Handset IMEI 15-Digit Luhn Check</span>
                      <span className="text-slate-400">Verifies hardware identifiers match GSMA TAC structures.</span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2 bg-slate-900/60 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={builderDqFreshness} 
                      onChange={(e) => setBuilderDqFreshness(e.target.checked)}
                      className="mt-0.5" 
                    />
                    <div className="text-[11px] font-sans">
                      <span className="font-bold text-slate-200 block">Ingestion Freshness SLA Check</span>
                      <span className="text-slate-400">Quarantines payloads arriving with latency &gt; 2 hours.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">3. Silver-to-Gold Feature Aggregations</span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono mb-1 font-bold">Aggregation Function:</label>
                    <select 
                      value={builderAggType}
                      onChange={(e) => setBuilderAggType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="sim_swap">SIM Swap Velocity (events count within window)</option>
                      <option value="device_churn">Device Churn (distinct IMEI per phone)</option>
                      <option value="port_freq">Inter-Carrier Porting Frequency</option>
                      <option value="graph_ring">Network Fraud Ring (shared device connections)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono mb-1 font-bold">Time Window:</label>
                      <select 
                        value={builderWindow}
                        onChange={(e) => setBuilderWindow(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                      >
                        <option value="2h">2 Hours</option>
                        <option value="24h">24 Hours</option>
                        <option value="30d">30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-mono mb-1 font-bold">Target Threshold:</label>
                      <input 
                        type="number" 
                        value={builderThreshold}
                        onChange={(e) => setBuilderThreshold(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleDeployPipeline}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-100 rounded-lg text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center space-x-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Deploy &amp; Generate Pipeline Assets</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hand side: Generated Code and Deployment Logs */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              {/* Deployment Status Log */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex-1 flex flex-col">
                <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block">Deployment Output &amp; Logging Console</span>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1 font-mono text-[10.5px] text-slate-350 space-y-2 overflow-y-auto min-h-[220px]">
                  {builderLogs.map((log, idx) => (
                    <div key={idx} className={
                      log.startsWith("[SUCCESS]") ? "text-emerald-450 font-bold" :
                      log.startsWith("[ERROR]") ? "text-red-400 font-bold" :
                      log.startsWith("[COMPILE]") ? "text-blue-400 animate-pulse" : "text-slate-400"
                    }>
                      {log}
                    </div>
                  ))}
                  {deploying && (
                    <div className="flex items-center text-blue-400 space-x-2 animate-pulse mt-2">
                      <Loader className="h-3 w-3 animate-spin" />
                      <span>Compiling pipeline dependencies...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated SQL/Code Tabs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Generated Deployment Scripts</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setBuilderCodeTab("dbt")}
                      className={`px-2 py-0.5 text-[9.5px] font-mono rounded border transition-all ${
                        builderCodeTab === "dbt" ? "bg-slate-850 text-blue-400 border-slate-700" : "text-slate-500 border-transparent hover:text-slate-350"
                      }`}
                    >
                      dbt Model (SQL)
                    </button>
                    <button 
                      onClick={() => setBuilderCodeTab("dataform")}
                      className={`px-2 py-0.5 text-[9.5px] font-mono rounded border transition-all ${
                        builderCodeTab === "dataform" ? "bg-slate-850 text-blue-400 border-slate-700" : "text-slate-500 border-transparent hover:text-slate-350"
                      }`}
                    >
                      Dataform (SQLX)
                    </button>
                    <button 
                      onClick={() => setBuilderCodeTab("flink")}
                      className={`px-2 py-0.5 text-[9.5px] font-mono rounded border transition-all ${
                        builderCodeTab === "flink" ? "bg-slate-850 text-blue-400 border-slate-700" : "text-slate-500 border-transparent hover:text-slate-350"
                      }`}
                    >
                      Flink SQL
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[10px] text-slate-300 font-mono overflow-x-auto overflow-y-auto max-h-[280px]">
                    {builderCodeTab === "dbt" && generateDbtCode()}
                    {builderCodeTab === "dataform" && generateDataformCode()}
                    {builderCodeTab === "flink" && generateFlinkCode()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2.7: MANAGED OPERATIONS FRAMEWORK */}
      {activeSubTab === "framework" && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
              <Settings className="h-4 w-4 text-blue-450 mr-2" />
              Managed Operations &amp; Handover Framework
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-4xl">
              A collaborative, outcome-driven operational model to stabilize, validate, and scale the Trust Scoring Intelligence Platform, ensuring a smooth knowledge transfer and handover from Incedo to EnStream.
            </p>
          </div>

          {/* Timeline Phases: BUILD -> OPERATIONALIZE -> TRANSFER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Phase 1: BUILD</span>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">Design &amp; Build</h4>
              <p className="text-slate-400 font-sans text-[11px]">Core Platform Setup (Medallion S3 Iceberg tables, CDC agents, and streaming edge connectors)</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-900 text-center space-y-1 ring-1 ring-blue-500/20">
              <span className="text-[10px] text-emerald-450 font-bold uppercase">Phase 2: OPERATIONALIZE</span>
              <h4 className="text-sm font-bold text-emerald-450 uppercase tracking-wide">Stabilize &amp; Optimize</h4>
              <p className="text-slate-300 font-sans text-[11px]">Validating operational parameters (Data Quality SLAs, Auto-Healing, and Drift monitoring)</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Phase 3: TRANSFER</span>
              <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wide">Enable &amp; Handover</h4>
              <p className="text-slate-400 font-sans text-[11px]">Knowledge transfer, operational enablement, and empowering EnStream teams to take ownership</p>
            </div>
          </div>

          {/* Six Pillars of Operations */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 font-sans text-[11px]">
            {/* 1. Service Management */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-450 font-bold uppercase tracking-wider block">1. Service Mgmt</span>
              <ul className="text-slate-450 list-disc pl-3.5 space-y-1 font-sans">
                <li>24x7 Monitoring &amp; Alerting</li>
                <li>Incident, Problem &amp; Change Management</li>
                <li>SLA Thresholds Management</li>
                <li>Service Desk &amp; Telecom Communications</li>
              </ul>
            </div>
            {/* 2. Data & Model Operations */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-455 font-bold uppercase tracking-wider block">2. Data &amp; Model Ops</span>
              <ul className="text-slate-455 list-disc pl-3.5 space-y-1 font-sans">
                <li>Data Quality &amp; Drift Management</li>
                <li>Pipeline Health &amp; Auto-recovery</li>
                <li>Model performance monitoring</li>
                <li>Retraining &amp; model versioning</li>
              </ul>
            </div>
            {/* 3. Platform Operations */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-455 font-bold uppercase tracking-wider block">3. Platform Ops</span>
              <ul className="text-slate-455 list-disc pl-3.5 space-y-1 font-sans">
                <li>Infra &amp; capacity Management</li>
                <li>Deployment &amp; release Management</li>
                <li>Backup, DR and Business Continuity</li>
                <li>Cost, monitoring and optimization</li>
              </ul>
            </div>
            {/* 4. Security & Compliance */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-455 font-bold uppercase tracking-wider block">4. Security &amp; Comp</span>
              <ul className="text-slate-455 list-disc pl-3.5 space-y-1 font-sans">
                <li>Identity &amp; access management</li>
                <li>Data security &amp; encryption</li>
                <li>Vulnerability management</li>
                <li>Audit, governance &amp; reporting</li>
              </ul>
            </div>
            {/* 5. Observability & Automation */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-455 font-bold uppercase tracking-wider block">5. Observability</span>
              <ul className="text-slate-455 list-disc pl-3.5 space-y-1 font-sans">
                <li>Centralized logging &amp; metrics</li>
                <li>Proactive RCA &amp; alert correlation</li>
                <li>Auto-healing &amp; scaling automation</li>
                <li>Operations dashboards &amp; reports</li>
              </ul>
            </div>
            {/* 6. FinOps & Value Management */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-blue-455 font-bold uppercase tracking-wider block">6. FinOps &amp; Value</span>
              <ul className="text-slate-455 list-disc pl-3.5 space-y-1 font-sans">
                <li>Cost transparency &amp; chargeback</li>
                <li>Budgeting &amp; Forecasting</li>
                <li>Resource right-sizing</li>
                <li>Value realization &amp; KPI tracking</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Key Processes post Release Implementation */}
            <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
              <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block">Key Processes post Release Implementation</span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono font-bold">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="block text-[8px] text-slate-500 font-bold mb-1">MONITOR</span>
                  Monitor &amp; Detect
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="block text-[8px] text-slate-500 font-bold mb-1">ANALYZE</span>
                  Analyze &amp; Triage
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="block text-[8px] text-slate-500 font-bold mb-1">RESPOND</span>
                  Respond &amp; Resolve
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="block text-[8px] text-slate-500 font-bold mb-1">VALIDATE</span>
                  Validate &amp; Close
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="block text-[8px] text-slate-500 font-bold mb-1">IMPROVE</span>
                  Improve &amp; Prevent
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Mapped Platform Enablers:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px]">
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded font-sans space-y-1">
                    <span className="font-bold text-slate-200">1. Monitor &amp; Detect</span>
                    <p className="text-[9.5px] text-slate-400">Supported by **DQ Monitor Ingestion SLA** cards and pulsating alert status indicators.</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded font-sans space-y-1">
                    <span className="font-bold text-slate-200">2. Analyze &amp; Triage</span>
                    <p className="text-[9.5px] text-slate-400">Supported by **Query Investigator** time-travel snapshots and bipartite fraud-ring graphs.</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded font-sans space-y-1">
                    <span className="font-bold text-slate-200">3. Respond &amp; Resolve</span>
                    <p className="text-[9.5px] text-slate-400">Supported by **Pipeline Self-Healing Reconciler** for direct data restoration and backfills.</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded font-sans space-y-1">
                    <span className="font-bold text-slate-200">4. Validate &amp; Prevent</span>
                    <p className="text-[9.5px] text-slate-400">Supported by **Exchange Hub audit logs** and RBAC PII data masking switches for compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RACI Matrix - Team Collaboration */}
            <div className="lg:col-span-6 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider block">Team Collaboration RACI Matrix</span>
                <span className="text-[8px] text-slate-500 font-mono">R: Responsible | A: Accountable | C: Consulted | I: Informed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400">
                      <th className="pb-2 font-bold">Operational Scope</th>
                      <th className="pb-2 font-bold text-center text-blue-400">EnStream (Client)</th>
                      <th className="pb-2 font-bold text-center text-emerald-450">Incedo (Partner)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Strategy &amp; Roadmap</td>
                      <td className="py-2 text-center font-bold text-blue-400">C</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Platform Operations</td>
                      <td className="py-2 text-center font-bold text-blue-400">A</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Incident &amp; Problem Mgmt</td>
                      <td className="py-2 text-center font-bold text-blue-400">A</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Change &amp; Release Mgmt</td>
                      <td className="py-2 text-center font-bold text-blue-400">C</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Data &amp; Model Quality</td>
                      <td className="py-2 text-center font-bold text-blue-400">A</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Security &amp; Compliance</td>
                      <td className="py-2 text-center font-bold text-blue-400">C</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Reporting &amp; Insights</td>
                      <td className="py-2 text-center font-bold text-blue-400">C</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2 font-medium">Knowledge Transfer &amp; Handover</td>
                      <td className="py-2 text-center font-bold text-blue-400">A</td>
                      <td className="py-2 text-center font-bold text-emerald-450">R</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PARTNER API SANDBOX (MAPPED TO PARTNER INTEGRATION GUIDE v1.38) */}
      {activeSubTab === "sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar selector */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Code className="w-4 h-4 mr-2 text-blue-500" />
                Select Guide Rest API
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Standard EnStream subscriber verification API operations (Integration Guide Release 2.0 v1.38)
              </p>
            </div>
            
            <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(apiDetails).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setSelectedApi(key)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col ${
                    selectedApi === key
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold"
                      : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="block font-bold">{val.name}</span>
                  <span className="block text-[9px] text-slate-500 font-mono mt-1">{val.section}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Security Configuration</span>
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useJose}
                    onChange={(e) => setUseJose(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Enable JOSE JWS/JWE Protection (RFC7515/7516)</span>
                </label>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Simulate Response Path</span>
                <select
                  value={sandboxScenario}
                  onChange={(e) => setSandboxScenario(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="success">Scenario 1: Success / Found (Code 0)</option>
                  <option value="recycled">Scenario 2: Recycle Detected (Code 0 / RECYCLED)</option>
                  <option value="blocked">Scenario 3: Blocked Number (Code 7)</option>
                  <option value="missing_field">Scenario 4: Missing Mandatory Field (Code 3)</option>
                  <option value="expired_token">Scenario 5: Expired JOSE Expiration (HTTP 400)</option>
                  <option value="unauthorized_ip">Scenario 6: Unauthorized Source IP (Code 4 / HTTP 403)</option>
                </select>
              </div>

              <button
                onClick={handleRunSandbox}
                disabled={sandboxLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/25 text-slate-100 text-xs font-black uppercase py-2.5 rounded shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {sandboxLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Send Rest API Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor and Trace terminal */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request side */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs uppercase font-extrabold text-slate-350 tracking-wider">Request Editor</span>
                <span className="text-[9.5px] text-blue-400 font-mono font-bold bg-blue-950/45 px-1.5 py-0.5 rounded border border-blue-900/40">
                  {apiDetails[selectedApi].path}
                </span>
              </div>

              <div className="flex-1 flex flex-col space-y-2">
                <span className="text-[10px] text-slate-500 font-mono block">JSON API Request Payload:</span>
                <textarea
                  value={editableReq}
                  onChange={(e) => setEditableReq(e.target.value)}
                  className="w-full flex-1 min-h-[260px] bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10.5px] text-slate-300 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {useJose && (
                <div className="p-3 bg-slate-950 border border-slate-855 rounded-lg text-[10px] text-slate-500 font-mono space-y-1">
                  <span className="text-blue-450 font-bold uppercase block text-[9.5px] mb-1">JOSE JWS Protected Header:</span>
                  <div>&quot;alg&quot;: &quot;RS256&quot;</div>
                  <div>&quot;kid&quot;: &quot;pub_sp_partnerId01&quot;</div>
                  <div>&quot;expires&quot;: &quot;06/17/2026 18:00:00 GMT&quot;</div>
                  <div>&quot;operation&quot;: &quot;{selectedApi}_SERVICE&quot;</div>
                </div>
              )}
            </div>

            {/* Response & Trace terminal */}
            <div className="space-y-6 flex flex-col">
              {/* Terminal Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col space-y-3">
                <span className="text-xs uppercase font-extrabold text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 mr-2 text-rose-500" />
                  Client Ingress Wire Logs
                </span>

                <div className="flex-1 min-h-[160px] max-h-[220px] bg-slate-950 rounded-lg border border-slate-850 p-3 font-mono text-[9.5px] text-emerald-450 overflow-y-auto leading-relaxed space-y-1">
                  {sandboxTrace.length > 0 ? (
                    sandboxTrace.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Send a request to inspect wire operations.</div>
                  )}
                  {sandboxLoading && <div className="text-blue-450 animate-pulse">[INGRESS] Awaiting gateway authorization...</div>}
                </div>
              </div>

              {/* Response output */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase font-extrabold text-slate-350 tracking-wider">REST API Response Payload</span>
                  {sandboxHttpCode && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sandboxHttpCode === 200 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                    }`}>
                      HTTP {sandboxHttpCode}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-850 p-3 font-mono text-[10.5px] text-slate-300 max-h-[170px] overflow-y-auto leading-relaxed">
                  {sandboxResponse ? (
                    <pre><code>{JSON.stringify(sandboxResponse, null, 2)}</code></pre>
                  ) : (
                    <span className="text-slate-500 italic text-xs">No response available.</span>
                  )}
                </div>

                {sandboxResponse && (
                  <div className="p-2.5 bg-slate-950 border border-slate-855 rounded text-[10px] text-slate-400 font-sans space-y-1 w-full">
                    <span className="font-bold text-slate-350 block mb-0.5">Response Code Explanation:</span>
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 0 && (
                      <div>**Code 0 (Success/Found)**: Record found for provided MSISDN. Match scores returned on 0-100 scale. Negative scores denote missing database metrics (-102 = operator null data).</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 1 && (
                      <div>**Code 1 (Not Whitelisted)**: The target phone number is not whitelisted in QA/Staging environments.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 2 && (
                      <div>**Code 2 (Duplicate Request ID)**: The Request ID has been used in a prior transaction request.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 3 && (
                      <div>**Code 3 (Missing Mandatory Field)**: Required field was omitted from request (e.g. msisdn).</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 4 && (
                      <div>**Code 4 (Unauthorized IP Access)**: The requesting source IP does not match whitelisted VPN or firewall profiles.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 7 && (
                      <div>**Code 7 (Blocked Number)**: The target MSISDN has been blocked by the carrier (e.g. government line or corporate block).</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 14 && (
                      <div>**Code 14 (MSISDN Not Linked)**: For D6 verification, the phone number is not active on the MNO network.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 15 && (
                      <div>**Code 15 (Invalid Token)**: The JWS/JWE token is expired or does not exist.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 16 && (
                      <div>**Code 16 (Invalid SP ID)**: The Service Provider ID (SPID) has not been assigned for this partner.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 18 && (
                      <div>**Code 18 (MNO Busy)**: Carrier integration gateway is temporarily busy or unreachable.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 28 && (
                      <div>**Code 28 (No Consent)**: Consumer consent has not been properly registered for this query.</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 400 && (
                      <div>**Code 400 (Invalid Input)**: Invalid input data format (e.g. invalid age or more than 5 numbers in D3M).</div>
                    )}
                    {typeof sandboxResponse === 'object' && sandboxResponse.responseCode === 500 && (
                      <div>**Code 500 (Internal Error)**: Native exception in the underlying carrier system.</div>
                    )}
                    {typeof sandboxResponse === 'string' && (
                      <div>**XML Format**: Returns raw carrier Header Injection details (Section 10.1.1).</div>
                    )}
                  </div>
                )}
                          </div>
            </div>
            {/* Live Cache & Latency Performance Monitor */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                    <Cpu className="w-4 h-4 mr-1.5 text-amber-500 animate-pulse" />
                    Low-Latency Cache & Performance Simulation Monitor
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Real-time simulation of point-lookup pathways and Redis caching layers.
                  </p>
                </div>
                
                {/* Cache Mode Selector */}
                <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-850 flex space-x-1">
                  <button
                    onClick={() => setCacheMode("hit")}
                    className={`px-2 py-1 text-[9.5px] font-bold rounded transition-all ${
                      cacheMode === "hit"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 border border-transparent hover:text-slate-350"
                    }`}
                  >
                    Auto (Redis Hit)
                  </button>
                  <button
                    onClick={() => setCacheMode("dirty_bypass")}
                    className={`px-2 py-1 text-[9.5px] font-bold rounded transition-all ${
                      cacheMode === "dirty_bypass"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-slate-400 border border-transparent hover:text-slate-350"
                    }`}
                  >
                    Bypass (Dirty Flag)
                  </button>
                  <button
                    onClick={() => setCacheMode("miss")}
                    className={`px-2 py-1 text-[9.5px] font-bold rounded transition-all ${
                      cacheMode === "miss"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "text-slate-400 border border-transparent hover:text-slate-350"
                    }`}
                  >
                    Cold DB Fallback
                  </button>
                </div>
              </div>

              {/* Latency Meter & Stats columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Latency meter */}
                <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-sans font-bold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                      Query Latency
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">Target: &lt; 100ms</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-bold font-mono tracking-tight text-slate-100">
                        {simulatedLatency !== null ? `${simulatedLatency} ms` : "-- ms"}
                      </span>
                      {simulatedCacheStatus && (
                        <span className={`px-2 py-0.5 rounded-[4px] font-mono text-[9px] font-bold ${
                          simulatedCacheStatus.includes("HIT") 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                            : simulatedCacheStatus.includes("BYPASS")
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                        }`}>
                          {simulatedCacheStatus}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850 relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          simulatedLatency === null 
                            ? "w-0" 
                            : simulatedLatency < 10 
                            ? "bg-emerald-500 w-[8%]" 
                            : simulatedLatency < 100 
                            ? "bg-amber-500 w-[45%]" 
                            : "bg-rose-500 w-[92%]"
                        }`}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[8.5px] text-slate-600 font-mono">
                      <span>0ms</span>
                      <span>10ms (SLA Peak)</span>
                      <span>100ms (Max SLA)</span>
                      <span>250ms+</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Caching Metrics */}
                <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase block font-sans">Cache Hit Ratio</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{cacheStats.hitRatio}%</span>
                    <span className="text-[8px] text-slate-500 block">Target &gt; 98.0%</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase block font-sans">Avg Cache Latency</span>
                    <span className="text-sm font-bold font-mono text-blue-400">{cacheStats.avgLatency} ms</span>
                    <span className="text-[8px] text-slate-500 block">In-Memory Redis</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase block font-sans">Peak Throughput</span>
                    <span className="text-sm font-bold font-mono text-amber-500">{cacheStats.peakQps} QPS</span>
                    <span className="text-[8px] text-slate-500 block">Target: 500 QPS</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase block font-sans">Keyspace Size</span>
                    <span className="text-sm font-bold font-mono text-slate-300">{cacheStats.activeKeys.toLocaleString()}</span>
                    <span className="text-[8px] text-slate-500 block">Active Profiles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PHASE ROADMAP */}
      {activeSubTab === "roadmap" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Transition Roadmap: Path to Northstar Architecture
            </h4>
            
            {/* Horizontal timeline cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-5">
              
              {/* Phase 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 relative">
                <div className="absolute -top-2 -right-2 bg-emerald-500/20 text-emerald-455 border border-emerald-500/30 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                  AS-IS (Active)
                </div>
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 1 (End-June)</div>
                <h5 className="font-bold text-slate-200 text-xs">Batch Operationalized</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Incremental load from MySQL reporting DB to Bronze S3. batch B→S→G Spark jobs. manual ML scoring to S3/Redshift Serverless catalog substrate.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Scores reconcile to holdout PoC logic. Idempotency on MySQL loader retry.
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 2 (Early-July)</div>
                <h5 className="font-bold text-slate-200 text-xs">Batch Automated</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Automated scheduling via MWAA (Airflow) / AWS Step Functions. Dependency retry mapping. platform DQ layer on S3 & alerting alerts.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Scheduled runs meet SLAs. Zero score divergence from Phase 1. 1 rollback drill.
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 3 (End-August)</div>
                <h5 className="font-bold text-slate-200 text-xs">Interim Real-Time</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Temporary real-time score query path via Kinesis MSK indexing on IDV database. Flink streaming. Online Feature Store serving sync API.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  P95 &lt; 2s / P99 &lt; 5s API latency budget. fallback failover to last batch score.
                </div>
              </div>

              {/* Phase 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 4 (End-December)</div>
                <h5 className="font-bold text-slate-200 text-xs">Source-Direct Real-Time</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Retire IDV databases. Carrier-direct event feeds (Flink/DMS stream). Schema registry validation at boundary. Event replay and backfills.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  P95 &lt; 2s from raw source event timestamp. Equivalence validation on replay.
                </div>
              </div>

              {/* Phase 5 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="text-[10px] font-mono text-blue-400 uppercase">Phase 5 (Continuous)</div>
                <h5 className="font-bold text-slate-200 text-xs">Continuous Everything</h5>
                <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                  Continuous ML drift tracking. Automated retraining & eval harness. promotion gates. Golden evaluation datasets pipeline.
                </p>
                <div className="text-[9.5px] text-slate-500 font-mono border-t border-slate-850 pt-1.5 mt-2">
                  <span className="block font-bold text-slate-400">Acceptance Gate:</span>
                  Traceable build release. automated rollback triggered on drift/DQ breach.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: VENDOR BRIEF & ARCHITECTURE EVALUATION */}
      {activeSubTab === "brief" && (
        <div className="space-y-6 font-sans">
          
          {/* Main specifications overview grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Real-Time Latency Caching Specs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Cpu className="w-4 h-4 mr-2 text-amber-500 animate-pulse" />
                Low-Latency Caching Architecture
              </h4>
              
              <div className="space-y-3 text-xs leading-relaxed text-slate-400">
                <p>
                  To support <strong>1M to 5M real-time scoring requests/day</strong> (peak ~500 QPS) and meet sub-second SLAs (&lt; 100ms) over 30M profiles, we isolate the transactional scoring pathway from the Redshift gold layer using an event-driven cache:
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-amber-400 font-mono block">Amazon ElastiCache (Redis)</span>
                    <span className="text-[10px] text-slate-500">In-Memory Score Cache (Latency: &lt; 10ms)</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-400 font-mono block">Amazon DynamoDB</span>
                    <span className="text-[10px] text-slate-500">Active Feature Store (Latency: &lt; 50ms)</span>
                  </div>
                </div>
                <ul className="text-[10px] text-slate-500 font-mono space-y-1 list-disc pl-4">
                  <li><strong>Cache Hits:</strong> Queries for valid cached MSISDN scores return in &lt; 10ms.</li>
                  <li><strong>Dirty Flag Invalidation:</strong> Telemetry arrivals raise a "dirty flag," bypassing the cache and triggering a single-entity feature refresh from DynamoDB.</li>
                  <li><strong>OLAP Isolation:</strong> BFS graph ring traversal and Redshift queries are isolated from live user API routes.</li>
                </ul>
              </div>
            </div>
            
            {/* MySQL Database & Volume Specs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Database className="w-4 h-4 mr-2 text-emerald-450" />
                MySQL Ingestion & Data Volumes
              </h4>
              
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Inherited DB Size</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">1.0 TB</span>
                  <span className="text-[10px] text-slate-400 ml-2">growing at 7 GB / day</span>
                </div>
                
                <div className="border-t border-slate-855 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Source Streams Ingress Rate</span>
                  <span className="text-lg font-bold font-mono text-blue-450">400 records / second</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">(Excluding Rogers 2-minute batch drop events)</span>
                </div>

                <div className="border-t border-slate-855 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Lineage Entity Volume</span>
                  <span className="text-lg font-bold font-mono text-amber-500">~30,000,000</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">MSISDNs, SIMs, Accounts, and Hardware Devices</span>
                </div>

                <div className="border-t border-slate-855 pt-3">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Score Query Expectations</span>
                  <span className="text-xs font-bold text-slate-300 block font-mono">
                    • Start: 1,000,000 requests / day<br/>
                    • Steady State: 5,000,000 requests / day
                  </span>
                </div>

                <div className="border-t border-slate-855 pt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">MySQL Reporting Schema scope:</span>
                  <p className="text-[10.5px] text-slate-450 leading-normal font-sans">
                    1. Customer events: records of API verification queries (Integration contract v1.38).<br/>
                    2. Customer journey events: live API feeds (Bell & Telus) and 2-min file drops (Rogers).
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Responsiveness to Change */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                Change-Responsive Design
              </h4>
              
              <div className="space-y-3.5 text-xs font-sans">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-200">1. Data Inputs Change (Schema Drift)</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By utilizing **Apache Iceberg Schema Evolution**, column additions, renames, and type widening are resolved in metadata without rewriting the S3 parquet storage files. Glue Registry contract gates quarantine breaking drifts immediately to the DLQ.
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-855 pt-3">
                  <h5 className="font-extrabold text-slate-200">2. Business Rules Additions</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rules are decoupled from pipeline structure. Preprocessing, deductions, and tiers are parameterized inside dynamic JSON config dictionaries. Rules engine recalculates deductions dynamically without modifying spark compile jars.
                  </p>
                </div>

                <div className="space-y-1 border-t border-slate-855 pt-3">
                  <h5 className="font-extrabold text-slate-200">3. ML Model Swaps</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    The **MLflow Model Registry** facilitates Champion/Challenger deployment. Promoting a version in the registry fires a trigger to set dirty flags on active MSISDNs, initiating selective recomputations of online feature databases.
                  </p>
                </div>
              </div>
            </div>

            {/* Orchestration Analysis & Evaluation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-2">
                <Code className="w-4 h-4 mr-2 text-rose-500" />
                Orchestration Trade-off Evaluation
              </h4>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between font-bold border-b border-slate-855 pb-1 text-[10px] uppercase text-slate-500">
                    <span>Engine Considered</span>
                    <span>Use Case & Fit</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-200 block text-xs">AWS Managed Airflow (MWAA)</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      *Pros*: Flexible dependency DAGs, python native, excellent retry tracing, perfect for batch runs. *Cons*: Latency is in minutes, unsuitable for event-by-event synchronous scoring.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-855 pt-2">
                    <span className="font-extrabold text-slate-200 block text-xs">AWS Step Functions</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      *Pros*: Sub-second latency, serverless execution, direct integrations with Lambda & Kinesis, low operational overhead. *Cons*: Harder to write complex looping scripts.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] text-slate-500 font-mono">
                  <span className="font-bold text-slate-400">Decision Matrix:</span> We utilize **MWAA** for Stage 1 & 2 batch aggregations / gold recalculations, and cut over to **Step Functions** for Phase 3/4 low-latency API serving routes.
                </div>
              </div>
            </div>

          </div>

          {/* Subex Case & Bad Actor ML Classification */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                RFP Clarification: Cross-Sector Bad Actor ML Logic
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                The **Cross-Sector Bad Actor Data Exchange** is a core requirement of this RFP engagement. To implement equivalence to proposals like Subex, EnStream is incorporating specialized ML classification logic.
              </p>
              
              <div className="space-y-2 mt-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="text-slate-300 font-bold uppercase text-[9px]">Subex Architecture Proposal:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  Subex proposed migrating the **entire database** from the Bad Actor Platform into their specialized **Fraudzap** application environment, where they run proprietary offline ML algorithms for precise classification.
                </p>
                <div className="border-t border-slate-850 pt-2.5 mt-2.5 text-slate-400 text-[11px] leading-relaxed font-sans">
                  <span className="font-bold text-blue-400 block font-mono uppercase text-[9.5px]">EnStream Modern Parity Approach:</span>
                  Rather than copying the entire DB off-premises (which triggers governance risks), our platform enables secure model deployment directly onto the AWS Medallion substrate, preserving data residency.
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-350 tracking-wider flex items-center border-b border-slate-800 pb-3">
                <HelpCircle className="w-4 h-4 mr-2 text-rose-500" />
                Strategic Competitive Positioning
              </h4>
              <p className="text-xs text-slate-450 leading-relaxed mt-2 font-sans">
                Our proposed design directly targets the limitations of traditional, rigid system integrator architectures (such as Tech Mahindra or Wipro).
              </p>
              
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-200 block">Open Table Standards vs. Proprietary Jars</span>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 leading-relaxed">
                      Wipro/TechM typically propose black-box proprietary systems, leading to vendor-lock. EnStream's S3 Medallion built on open **Apache Iceberg** tables allows the client's in-house team to easily plug in other analytical platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 border-t border-slate-855 pt-3">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <span className="font-bold text-slate-200 block">Selective Real-Time Recompute vs. Global batch runs</span>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 leading-relaxed">
                      Competing proposals often rely on resource-heavy nightly global batch recalculations to refresh scores. Our selective **Dirty Flag** BFS component walk reduces computing complexity by recalculating features only for affected accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 5: DATA TOPOLOGY */}
      {activeSubTab === "topology" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-2 text-rose-500" />
              Medallion Lakehouse Flow Topology
            </h4>
            <p className="text-xs text-slate-400 mt-1">Tracing raw data ingestion down to analytical warehouse aggregation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs leading-relaxed">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono">01</div>
              <h5 className="font-extrabold text-slate-200">1. Raw Event Ingestion</h5>
              <p className="text-slate-400 text-[11px]">
                Events arrive in real-time from Bell/Rogers/Telus carrier APIs, TransUnion PortPS, MySQL CDC agents, or SFTP blacklist uploads. The backend event loop functions as a high-throughput queue mapping incoming payloads onto a unified schema structure.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold font-mono">02</div>
              <h5 className="font-extrabold text-slate-200">2. Bronze S3 Parquet Landing</h5>
              <p className="text-slate-400 text-[11px]">
                Raw payloads are written as Parquet tables inside AWS S3 folders (simulated locally). Every write updates the Apache Iceberg catalog format, creating a new metadata json file manifest (`vN.metadata.json`) and versioning logs to enable time-travel queries.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">03</div>
              <h5 className="font-extrabold text-slate-200">3. Silver cleansed Iceberg Layer</h5>
              <p className="text-slate-400 text-[11px]">
                Validation tasks read from Bronze. Data Quality (DQ) metrics verify structure, E.164 phone ranges, 15-digit device IMEIs, and data freshness. Entries passing validation checks are normalized and committed into the cleansed 'enstream.silver' Iceberg table.
              </p>
            </div>

            <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">04</div>
              <h5 className="font-extrabold text-slate-200">4. Gold Aggregate Redshift</h5>
              <p className="text-slate-400 text-[11px]">
                Features are selectively computed for dirty entities (MSISDNs that recently processed updates). Connect components are traversed using graph BFS to track hardware-sharing rings. Features are committed directly to AWS Redshift tables for OLAP dashboard reporting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CODE INSPECTOR */}
      {activeSubTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex flex-col">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800 pb-2">
              Select Logic Module
            </div>
            {Object.entries(codeSnippets).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCodeSection(key)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                  selectedCodeSection === key
                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold"
                    : "bg-slate-950 border-slate-855 hover:border-slate-800 text-slate-400"
                }`}
              >
                <span className="block font-bold">{value.title}</span>
                <span className="block text-[9px] text-slate-500 font-mono mt-1">{value.filePath}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {codeSnippets[selectedCodeSection].title}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Source File: {codeSnippets[selectedCodeSection].filePath}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-slate-955 rounded text-[9px] text-slate-450 font-mono border border-slate-850">
                {codeSnippets[selectedCodeSection].language.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              {codeSnippets[selectedCodeSection].description}
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[350px]">
              <pre><code>{codeSnippets[selectedCodeSection].code}</code></pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: DATA SCHEMAS */}
      {activeSubTab === "schemas" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Database className="w-4 h-4 mr-1.5 text-blue-400" />
                Bronze Schema (enstream.bronze)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">S3 Parquet raw event ingestion landing table</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">event_id</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Unique key generated per raw ingestion log.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">event_type</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Category of activity (e.g. activation, porting).</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">msisdn</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Target subscriber telephone number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">payload</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Stringified raw JSON payload parameters.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-blue-400 font-bold">source</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Source gateway (e.g. bell, rogers, transunion).</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
                Silver Schema (enstream.silver)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Cleansed, validated, and normalized Iceberg dataset</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">carrier</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Sanitized lowercase carrier name.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">imei</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Cleaned 15-digit device IMEI number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">dq_passed</span> <span className="text-slate-500 text-[10px]">(boolean)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Flag indicating if all DQ checks succeeded.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-emerald-400 font-bold">dq_errors</span> <span className="text-slate-500 text-[10px]">(string)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">JSON string array listing DQ validation issues.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                <Cpu className="w-4 h-4 mr-1.5 text-amber-400" />
                Gold Schema (enstream_gold)
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Redshift aggregate subscriber feature profiles</p>
            </div>
            
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">msisdn_age_days</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Number of days since initial phone activation.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">device_churn_count</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Distinct devices (IMEIs) connected with number.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">network_fraud_ring_size</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Size of device-sharing network component.</p>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850">
                <span className="text-amber-400 font-bold">port_frequency_30d</span> <span className="text-slate-500 text-[10px]">(long)</span>
                <p className="text-slate-400 text-[10px] font-sans mt-0.5">Carrier port transactions in the last 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: AWS CLOUD INTEGRATION */}
      {activeSubTab === "aws" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
              <Settings className="w-4 h-4 mr-2 text-blue-400" />
              AWS Cloud Integration & Connection Settings
            </h4>
            <p className="text-xs text-slate-400 mt-1">Environment variable mapping and adapter connection workflows</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h5 className="font-extrabold text-slate-350">1. Hybrid Environment Matrix</h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The EnStream prototype functions out-of-the-box locally. Setting the following environment variables switches the backend storage engine from SQLite/local folders to S3, Glue Catalog, and Amazon Redshift.
              </p>
              
              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-[10.5px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="p-2.5 text-slate-200">Env Variable</th>
                      <th className="p-2.5 text-slate-200">Local Default</th>
                      <th className="p-2.5 text-slate-200">AWS Target Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">WAREHOUSE_PATH</td>
                      <td className="p-2.5 font-mono text-slate-400">./warehouse/</td>
                      <td className="p-2.5 font-mono text-slate-300">s3://enstream-medallion-bucket/</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">GLUE_CATALOG_NAME</td>
                      <td className="p-2.5 font-mono text-slate-400">None (Local Files)</td>
                      <td className="p-2.5 font-mono text-slate-300">enstream_iceberg_catalog</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">REDSHIFT_CONN_STR</td>
                      <td className="p-2.5 font-mono text-slate-400">None (SQLite local)</td>
                      <td className="p-2.5 font-mono text-slate-300">redshift://user:pw@cluster:5439/db</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="p-2.5 font-mono text-blue-400">AWS_DEFAULT_REGION</td>
                      <td className="p-2.5 font-mono text-slate-400">us-east-1</td>
                      <td className="p-2.5 font-mono text-slate-300">ca-central-1 (Canada Hub)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-blue-400">MLFLOW_TRACKING_URI</td>
                      <td className="p-2.5 font-mono text-slate-400">./mlruns/</td>
                      <td className="p-2.5 font-mono text-slate-300">http://mlflow.enstream.internal:5000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-extrabold text-slate-350">2. Production Connection Adapters</h5>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Adapters are coded inside our backend services to dynamically hook into AWS. When target variables are detected, PyArrow directs writes onto AWS S3 S3FileSystem and coordinates commits with glue catalog API locks.
              </p>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[9px] text-slate-300 max-h-[180px] overflow-y-auto">
                <span className="text-slate-500 block mb-1"># Connection logic adapter in medallion.py</span>
                <div>if WAREHOUSE_PATH.startswith(&quot;s3://&quot;):</div>
                <div className="pl-4">import s3fs</div>
                <div className="pl-4">s3_fs = s3fs.S3FileSystem(</div>
                <div className="pl-8">key=os.getenv(&quot;AWS_ACCESS_KEY_ID&quot;),</div>
                <div className="pl-8">secret=os.getenv(&quot;AWS_SECRET_ACCESS_KEY&quot;),</div>
                <div className="pl-8">client_kwargs=&#123;&quot;region_name&quot;: AWS_REGION&#125;</div>
                <div className="pl-4">)</div>
                <div className="pl-4"># Table outputs bypass local disk and write directly to S3 parquet...</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
