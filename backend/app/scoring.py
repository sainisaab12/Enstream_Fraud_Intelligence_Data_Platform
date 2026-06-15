import time
from typing import Dict, Any, List
from app.state import state

def score_msisdn(msisdn: str) -> Dict[str, Any]:
    """
    Computes a trust score (0-100) and suspicion tier for a phone number.
    Returns score results and SHAP-like explainability features.
    """
    # 1. Fetch features from online store or compute on-the-fly
    with state.lock:
        features = state.online_feature_store.get(msisdn)
        
    if not features:
        # Import inside function to avoid circular imports
        from app.features import compute_features_for_msisdn
        features = compute_features_for_msisdn(msisdn)
        with state.lock:
            state.online_feature_store[msisdn] = features

    # Get Active Champion Model coefficients/weights (simulated rule weights)
    model_ver = state.model_registry["champion_version"]
    model_meta = state.model_registry["models"][model_ver]
    
    # Base trust starts at 100
    trust_score = 100.0
    reason_codes = []
    explainability = {}
    
    # Feature penalties:
    # A. Fraud exchange match (critical)
    blacklist_matches = features.get("fraud_exchange_matches", 0)
    if blacklist_matches > 0:
        penalty = 60.0
        trust_score -= penalty
        reason_codes.append("FRAUD_EXCHANGE_HIT")
        explainability["fraud_exchange_matches"] = -penalty
    else:
        explainability["fraud_exchange_matches"] = 0.0

    # B. Porting frequency in 30 days
    ports = features.get("port_frequency_30d", 0)
    if ports > 0:
        penalty = min(40.0, ports * 15.0)
        trust_score -= penalty
        reason_codes.append("SUSPICIOUS_PORTING_HISTORY" if ports > 1 else "RECENT_PORT_ACTIVITY")
        explainability["port_frequency_30d"] = -penalty
    else:
        explainability["port_frequency_30d"] = 0.0
        
    # D. Device churn (IMEI swaps)
    churn = features.get("device_churn_count", 0)
    if churn > 1:
        penalty = min(30.0, (churn - 1) * 10.0)
        trust_score -= penalty
        reason_codes.append("RAPID_SIM_OR_IMEI_CHANGES" if churn > 2 else "DEVICE_CHURN_DETECTED")
        explainability["device_churn_count"] = -penalty
    else:
        explainability["device_churn_count"] = 0.0
        
    # E. Fraud Ring shared IMEI linkage
    ring_size = features.get("network_fraud_ring_size", 0)
    if ring_size > 0:
        penalty = min(50.0, ring_size * 20.0)
        trust_score -= penalty
        reason_codes.append("FRAUD_RING_IMEI_SHARING")
        explainability["network_fraud_ring_size"] = -penalty
    else:
        explainability["network_fraud_ring_size"] = 0.0
        
    # F. Activation recency (new activations are less trusted initially)
    recency = features.get("activation_recency_hours", 999.0)
    if recency < 24.0:
        penalty = 15.0
        trust_score -= penalty
        reason_codes.append("RECENT_LINE_ACTIVATION")
        explainability["activation_recency_hours"] = -penalty
    else:
        explainability["activation_recency_hours"] = 0.0
        
    # G. MSISDN Age bonus (longer age builds trust)
    age = features.get("msisdn_age_days", 0)
    if age > 180:
        bonus = 10.0
        trust_score += bonus
        explainability["msisdn_age_days"] = bonus
    else:
        explainability["msisdn_age_days"] = 0.0

    # Ensure score bounds
    trust_score = max(0.0, min(100.0, trust_score))
    trust_score = int(round(trust_score))
    
    # Classify suspicion tier and fraud flags
    if trust_score >= 80:
        tier = "Low Risk"
        fraud_flag = False
    elif trust_score >= 50:
        tier = "Medium Risk"
        fraud_flag = False
    elif trust_score >= 20:
        tier = "High Risk"
        fraud_flag = True
    else:
        tier = "Critical Risk"
        fraud_flag = True
        
    if not reason_codes and trust_score >= 85:
        reason_codes.append("ESTABLISHED_LEGITIMATE_SUBSCRIBER")

    score_result = {
        "msisdn": msisdn,
        "customer_name": features.get("customer_name", "Unknown"),
        "carrier": features.get("carrier", "unknown"),
        "trust_score": trust_score,
        "suspicion_tier": tier,
        "fraud_flag": fraud_flag,
        "reason_codes": reason_codes,
        "explainability": explainability,
        "model_version": model_ver,
        "calculated_at": time.time()
    }
    
    with state.lock:
        state.score_cache[msisdn] = score_result
        
    return score_result
