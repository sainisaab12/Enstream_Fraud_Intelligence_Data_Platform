import threading
import time
from typing import Dict, List, Set, Any

class AppState:
    def __init__(self):
        self.lock = threading.Lock()
        
        # Medallion layers (in-memory simulation)
        self.bronze: List[Dict[str, Any]] = []
        self.silver: List[Dict[str, Any]] = []
        self.gold: Dict[str, Dict[str, Any]] = {} # msisdn -> gold metrics
        
        # Online Feature Store (msisdn -> features)
        self.online_feature_store: Dict[str, Dict[str, Any]] = {}
        
        # Dirty Flags (set of MSISDNs needing feature/score refresh)
        self.dirty_entities: Set[str] = set()
        
        # Score Cache (msisdn -> score details)
        self.score_cache: Dict[str, Dict[str, Any]] = {}
        
        # Simulated Kafka Event Bus Log
        self.event_bus_logs: List[Dict[str, Any]] = []
        self.max_bus_logs = 100
        
        # Data Quality Logs
        self.dq_logs: List[Dict[str, Any]] = []
        self.dq_summary = {
            "total_checked": 0,
            "total_passed": 0,
            "total_failed": 0,
            "failed_by_rule": {
                "schema_validation": 0,
                "completeness": 0,
                "uniqueness": 0,
                "freshness": 0,
                "referential_integrity": 0
            }
        }
        
        # Model Registry
        self.model_registry = {
            "models": {
                "v1.0.0": {
                    "version": "v1.0.0",
                    "name": "XGBoost-Fraud-Trust-Base",
                    "status": "Champion",
                    "created_at": time.time() - 86400 * 10,
                    "metrics": {"auc": 0.885, "precision": 0.83, "recall": 0.80, "f1": 0.815},
                    "parameters": {"max_depth": 6, "learning_rate": 0.05, "n_estimators": 150}
                },
                "v1.1.0": {
                    "version": "v1.1.0",
                    "name": "XGBoost-Fraud-Trust-Updated",
                    "status": "Challenger",
                    "created_at": time.time() - 3600 * 4,
                    "metrics": {"auc": 0.908, "precision": 0.85, "recall": 0.82, "f1": 0.835},
                    "parameters": {"max_depth": 7, "learning_rate": 0.03, "n_estimators": 200}
                }
            },
            "champion_version": "v1.0.0",
            "challenger_version": "v1.1.0",
            "history": [
                {"timestamp": time.time() - 86400 * 10, "action": "register", "version": "v1.0.0", "user": "mlops-system"},
                {"timestamp": time.time() - 86400 * 10, "action": "promote", "version": "v1.0.0", "user": "fraud-lead-admin"},
                {"timestamp": time.time() - 3600 * 4, "action": "register", "version": "v1.1.0", "user": "mlops-pipeline"}
            ]
        }
        
        # Ingestion metrics
        self.ingestion_status = {
            "mysql": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.0.0"},
            "transunion": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.0.0"},
            "bell": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.1.0"},
            "rogers": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.1.0"},
            "telus": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.1.0"},
            "sftp": {"rows": 0, "watermark": None, "status": "idle", "schema_version": "1.0.0"}
        }
        
        # MLOps Runs
        self.pipeline_runs = [
            {
                "run_id": "run_98231",
                "pipeline": "Training & Evaluation",
                "status": "completed",
                "started_at": time.time() - 3600 * 5,
                "duration": 284,
                "metrics": {"auc": 0.908, "f1": 0.835},
                "artifacts": ["model_v1.1.0.bin", "eval_plots_v1.1.0.json"]
            }
        ]
        
        # Drift metrics
        self.drift_metrics = {
            "psi": 0.08,  # Population Stability Index (baseline vs current)
            "score_drift": 0.04,
            "feature_drifts": {
                "device_churn_count": 0.06,
                "port_frequency_30d": 0.09,
                "msisdn_age_days": 0.03,
                "network_fraud_ring_size": 0.12
            },
            "alerts": []
        }
        
        # Simulation configs
        self.simulation_active = True
        self.simulation_speed = 3.0  # seconds per event
        
        # SSE Clients queue
        self.sse_listeners = []

        # --- CROSS-SECTOR BAD ACTOR DATA EXCHANGE MVP STATE ---
        self.exchange_lookup_count = 142
        self.exchange_participants = {
            "TD_BANK": {
                "participant_id": "TD_BANK",
                "legal_name": "The Toronto-Dominion Bank",
                "display_name": "TD Bank",
                "sector": "bank",
                "country": "CA",
                "submission_channel": "bank_sftp",
                "lookup_enabled": True,
                "submission_enabled": True,
                "participant_status": "active",
                "status_reason": "onboarding_complete",
                "agreement_signed_ts": time.time() - 86400 * 120,
                "activated_ts": time.time() - 86400 * 110,
                "primary_contact_email": "fraud-ops@td.com",
                "technical_contact_email": "data-eng@td.com"
            },
            "BELL_CA": {
                "participant_id": "BELL_CA",
                "legal_name": "Bell Canada Mobility",
                "display_name": "Bell",
                "sector": "telco",
                "country": "CA",
                "submission_channel": "telco_s3",
                "lookup_enabled": True,
                "submission_enabled": True,
                "participant_status": "active",
                "status_reason": "onboarding_complete",
                "agreement_signed_ts": time.time() - 86400 * 115,
                "activated_ts": time.time() - 86400 * 105,
                "primary_contact_email": "fraud-ops@bell.ca",
                "technical_contact_email": "data-eng@bell.ca"
            },
            "ROGERS_CA": {
                "participant_id": "ROGERS_CA",
                "legal_name": "Rogers Communications Inc.",
                "display_name": "Rogers",
                "sector": "telco",
                "country": "CA",
                "submission_channel": "telco_s3",
                "lookup_enabled": True,
                "submission_enabled": True,
                "participant_status": "active",
                "status_reason": "onboarding_complete",
                "agreement_signed_ts": time.time() - 86400 * 110,
                "activated_ts": time.time() - 86400 * 100,
                "primary_contact_email": "fraud-ops@rogers.com",
                "technical_contact_email": "data-eng@rogers.com"
            },
            "RBC_BANK": {
                "participant_id": "RBC_BANK",
                "legal_name": "Royal Bank of Canada",
                "display_name": "RBC Royal Bank",
                "sector": "bank",
                "country": "CA",
                "submission_channel": "bank_sftp",
                "lookup_enabled": True,
                "submission_enabled": True,
                "participant_status": "active",
                "status_reason": "onboarding_complete",
                "agreement_signed_ts": time.time() - 86400 * 90,
                "activated_ts": time.time() - 86400 * 85,
                "primary_contact_email": "fraud-ops@rbc.com",
                "technical_contact_email": "data-eng@rbc.com"
            },
            "CIBC_BANK": {
                "participant_id": "CIBC_BANK",
                "legal_name": "Canadian Imperial Bank of Commerce",
                "display_name": "CIBC",
                "sector": "bank",
                "country": "CA",
                "submission_channel": "bank_sftp",
                "lookup_enabled": True,
                "submission_enabled": True,
                "participant_status": "active",
                "status_reason": "onboarding_complete",
                "agreement_signed_ts": time.time() - 86400 * 80,
                "activated_ts": time.time() - 86400 * 75,
                "primary_contact_email": "fraud-ops@cibc.com",
                "technical_contact_email": "data-eng@cibc.com"
            }
        }

        self.exchange_records = [
            {
                "record_id": "019408a1-3c11-7f89-8d9e-1234567890ab",
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a91",
                "participant_id": "TD_BANK",
                "msisdn": "+14165550199",
                "imei": "352099001761481",
                "pii_name": "John Doe",
                "pii_email": "johndoe@gmail.com",
                "pii_address": "123 Main St, Toronto, ON",
                "pii_ip_address": "192.168.1.50",
                "fraud_type": "synthetic_id",
                "fraud_event_ts": time.time() - 86400 * 60,
                "source": "online_banking_login",
                "record_status": "active",
                "dq_status": "passed",
                "created_ts": time.time() - 86400 * 59,
                "updated_ts": time.time() - 86400 * 59,
                "ownership_status": "Owned",
                "ownership_status_ts": time.time() - 86400 * 59
            },
            {
                "record_id": "019409b2-4d22-8f90-9e9f-2345678901bc",
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a92",
                "participant_id": "ROGERS_CA",
                "msisdn": "+14165551234",
                "imei": "356789012345678",
                "pii_name": "John Smith",
                "pii_email": "jsmith@rogers.com",
                "pii_address": "456 Bay St, Toronto, ON",
                "pii_ip_address": "172.16.5.12",
                "fraud_type": "first_party_fraud",
                "fraud_event_ts": time.time() - 86400 * 50,
                "source": "mno_portal",
                "record_status": "active",
                "dq_status": "passed",
                "created_ts": time.time() - 86400 * 49,
                "updated_ts": time.time() - 86400 * 49,
                "ownership_status": "Recycled",
                "ownership_status_ts": time.time() - 86400 * 49
            },
            {
                "record_id": "01940a03-5e33-9f01-afaf-3456789012cd",
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a93",
                "participant_id": "CIBC_BANK",
                "msisdn": "+14165551234",
                "imei": "356789012345678",
                "pii_name": "John Smith",
                "pii_email": "jsmith@rogers.com",
                "pii_address": "456 Bay St, Toronto, ON",
                "pii_ip_address": "172.16.5.12",
                "fraud_type": "first_party_fraud",
                "fraud_event_ts": time.time() - 86400 * 45,
                "source": "mortgage_application",
                "record_status": "active",
                "dq_status": "passed",
                "created_ts": time.time() - 86400 * 44,
                "updated_ts": time.time() - 86400 * 44,
                "ownership_status": "Recycled",
                "ownership_status_ts": time.time() - 86400 * 44
            },
            {
                "record_id": "01940b14-6f44-af12-bf0f-4567890123de",
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a94",
                "participant_id": "BELL_CA",
                "msisdn": "+14165559001",
                "imei": "35991104111222",
                "pii_name": "Bob Jenkins",
                "pii_email": "bjenk@hotmail.com",
                "pii_address": "789 Yonge St, Toronto, ON",
                "pii_ip_address": "10.0.0.4",
                "fraud_type": "account_takeover",
                "fraud_event_ts": time.time() - 86400 * 30,
                "source": "sim_activation_flow",
                "record_status": "active",
                "dq_status": "passed",
                "created_ts": time.time() - 86400 * 29,
                "updated_ts": time.time() - 86400 * 29,
                "ownership_status": "Owned",
                "ownership_status_ts": time.time() - 86400 * 29
            }
        ]

        self.exchange_submissions = [
            {
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a91",
                "source_name": "td_bank_sftp",
                "source_type": "bank_sftp",
                "participant_id": "TD_BANK",
                "received_ts": time.time() - 86400 * 59,
                "parse_status": "parsed",
                "record_count": 1,
                "quarantine_reason": None,
                "created_ts": time.time() - 86400 * 59
            },
            {
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a92",
                "source_name": "rogers_ca_s3",
                "source_type": "telco_s3",
                "participant_id": "ROGERS_CA",
                "received_ts": time.time() - 86400 * 49,
                "parse_status": "parsed",
                "record_count": 1,
                "quarantine_reason": None,
                "created_ts": time.time() - 86400 * 49
            },
            {
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a93",
                "source_name": "cibc_bank_sftp",
                "source_type": "bank_sftp",
                "participant_id": "CIBC_BANK",
                "received_ts": time.time() - 86400 * 44,
                "parse_status": "parsed",
                "record_count": 1,
                "quarantine_reason": None,
                "created_ts": time.time() - 86400 * 44
            },
            {
                "file_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a94",
                "source_name": "bell_ca_s3",
                "source_type": "telco_s3",
                "participant_id": "BELL_CA",
                "received_ts": time.time() - 86400 * 29,
                "parse_status": "parsed",
                "record_count": 1,
                "quarantine_reason": None,
                "created_ts": time.time() - 86400 * 29
            }
        ]

        self.exchange_corrections = [
            {
                "correction_id": "019511aa-a123-7a7e-128a-1294819dfbcf",
                "participant_id": "TD_BANK",
                "record_id": "019408a1-3c11-7f89-8d9e-1234567890ab",
                "reason": "data_entry_error",
                "requested_ts": time.time() - 86400 * 10,
                "applied_ts": time.time() - 86400 * 10,
                "change_diff": '{"record_status": {"before": "active", "after": "withdrawn"}}'
            }
        ]

        self.exchange_lookups = [
            {
                "lookup_id": "01950ff2-df21-711a-11bc-1294a9dcb89f",
                "participant_id": "RBC_BANK",
                "request_msisdn": "+14165550199",
                "phone_number_match": True,
                "imei_match": True,
                "request_imei": "352099001761481",
                "request_as_of_ts": None,
                "request_ts": time.time() - 3600 * 2,
                "response_payload": '{"match": true}',
                "response_ts": time.time() - 3600 * 2 + 0.12,
                "correlation_id": "0193b3c4-9f12-7a2e-b6e3-b8f0d12c4a91"
            }
        ]

state = AppState()
