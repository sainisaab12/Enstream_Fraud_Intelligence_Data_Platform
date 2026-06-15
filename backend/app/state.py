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

state = AppState()
