import time
import math
import random
from typing import Dict, Any, List
from app.state import state

def promote_model(version: str, user: str = "operator") -> bool:
    """Promotes a model version to Champion"""
    with state.lock:
        if version not in state.model_registry["models"]:
            return False
            
        old_champion = state.model_registry["champion_version"]
        
        # Demote current champion
        if old_champion in state.model_registry["models"]:
            state.model_registry["models"][old_champion]["status"] = "Retired"
            
        # Promote new champion
        state.model_registry["models"][version]["status"] = "Champion"
        state.model_registry["champion_version"] = version
        
        # Track history
        state.model_registry["history"].append({
            "timestamp": time.time(),
            "action": "promote",
            "version": version,
            "user": user
        })
        return True

def rollback_model(version: str, user: str = "operator") -> bool:
    """Rolls back champion to a retired/challenger model version"""
    return promote_model(version, f"rollback-{user}")

def run_mlops_training_pipeline() -> Dict[str, Any]:
    """Simulates MLOps Training, Evaluation, and Challenger Registration"""
    run_id = f"run_{random.randint(10000, 99999)}"
    
    # Simulate work
    pipeline_run = {
        "run_id": run_id,
        "pipeline": "Training & Evaluation",
        "status": "running",
        "started_at": time.time(),
        "duration": 0,
        "metrics": {},
        "artifacts": []
    }
    
    with state.lock:
        state.pipeline_runs.insert(0, pipeline_run)
        if len(state.pipeline_runs) > 20:
            state.pipeline_runs.pop()
            
    # Mock computation time and metrics
    time.sleep(1.0)
    
    # Generate a new model version
    v_major = 1
    v_minor = len(state.model_registry["models"])
    new_version = f"v{v_major}.{v_minor}.0"
    
    auc = round(0.90 + random.uniform(0.01, 0.03), 3)
    f1 = round(0.82 + random.uniform(0.01, 0.03), 3)
    prec = round(0.84 + random.uniform(0.01, 0.03), 3)
    rec = round(0.81 + random.uniform(0.01, 0.03), 3)
    
    model_entry = {
        "version": new_version,
        "name": f"XGBoost-Fraud-Trust-{new_version}",
        "status": "Challenger",
        "created_at": time.time(),
        "metrics": {"auc": auc, "precision": prec, "recall": rec, "f1": f1},
        "parameters": {"max_depth": random.choice([5, 6, 7, 8]), "learning_rate": 0.02, "n_estimators": 250}
    }
    
    with state.lock:
        # Register new challenger
        state.model_registry["models"][new_version] = model_entry
        state.model_registry["challenger_version"] = new_version
        state.model_registry["history"].append({
            "timestamp": time.time(),
            "action": "register",
            "version": new_version,
            "user": "mlops-pipeline"
        })
        
        # Complete pipeline run
        pipeline_run["status"] = "completed"
        pipeline_run["duration"] = 12.5 # simulated seconds
        pipeline_run["metrics"] = {"auc": auc, "f1": f1}
        pipeline_run["artifacts"] = [f"model_{new_version}.bin", f"eval_plots_{new_version}.json"]
        
    return pipeline_run

def calculate_drift_metrics() -> Dict[str, Any]:
    """
    Calculates Population Stability Index (PSI) and feature/score drifts.
    Compares active score cache against legitimate seed distribution.
    """
    with state.lock:
        scores = [x["trust_score"] for x in state.score_cache.values()]
        
    if not scores:
        return state.drift_metrics
        
    # Baseline expected distribution: mostly high trust (legitimate subscribers)
    expected = [0.05, 0.10, 0.15, 0.70]
    
    # Calculate actual buckets
    buckets = [0, 0, 0, 0]
    for s in scores:
        if s <= 25:
            buckets[0] += 1
        elif s <= 50:
            buckets[1] += 1
        elif s <= 75:
            buckets[2] += 1
        else:
            buckets[3] += 1
            
    total = len(scores)
    actual = [b / total for b in buckets]
    
    # Calculate PSI
    psi = 0.0
    for a_pct, e_pct in zip(actual, expected):
        if a_pct == 0:
            a_pct = 0.001
        if e_pct == 0:
            e_pct = 0.001
        psi += (a_pct - e_pct) * math.log(a_pct / e_pct)
        
    psi = round(psi, 4)
    
    # Generate drift alerts
    alerts = []
    if psi > 0.25:
        alerts.append({
            "timestamp": time.time(),
            "level": "CRITICAL",
            "message": f"High Population Drift (PSI={psi:.3f}). Model rescoring or retraining is highly recommended."
        })
    elif psi > 0.10:
        alerts.append({
            "timestamp": time.time(),
            "level": "WARNING",
            "message": f"Moderate Population Drift detected (PSI={psi:.3f})."
        })
        
    # Generate feature drifts dynamically
    feature_drifts = {
        "device_churn_count": round(random.uniform(0.02, 0.08) + (0.15 if psi > 0.2 else 0), 3),
        "port_frequency_30d": round(random.uniform(0.03, 0.09) + (0.20 if psi > 0.2 else 0), 3),
        "msisdn_age_days": round(random.uniform(0.01, 0.05), 3),
        "network_fraud_ring_size": round(random.uniform(0.05, 0.15) + (0.25 if psi > 0.2 else 0), 3)
    }
    
    drift_res = {
        "psi": psi,
        "score_drift": round(psi * 0.5, 3),
        "feature_drifts": feature_drifts,
        "alerts": alerts
    }
    
    with state.lock:
        state.drift_metrics = drift_res
        
    return drift_res
