import time
import json
import pandas as pd
from typing import Dict, Any
from app.state import state
from app.medallion import get_sqlite_conn, write_to_gold

def compute_features_for_msisdn(msisdn: str) -> Dict[str, Any]:
    """
    Reads Silver records and computes features for the Online Feature Store
    """
    with state.lock:
        # Filter silver events for this MSISDN
        user_events = [x for x in state.silver if x.get("msisdn") == msisdn and x.get("dq_passed") == True]
        
    if not user_events:
        # Default features if no clean history is found
        return {
            "msisdn": msisdn,
            "customer_name": "Unknown",
            "carrier": "unknown",
            "msisdn_age_days": 0,
            "port_frequency_30d": 0,
            "activation_recency_hours": 999.0,
            "device_churn_count": 0,
            "fraud_exchange_matches": 0,
            "network_fraud_ring_size": 0,
            "last_update_time": time.time()
        }
        
    # 1. MSISDN Age (days since first activation)
    act_events = [x for x in user_events if x["event_type"] == "activation"]
    if act_events:
        oldest_act = min(x["timestamp"] for x in act_events)
        msisdn_age_days = max(0, int((time.time() - oldest_act) / 86400))
        customer_name = json_get(act_events[0]["normalized_payload"], "customer_name") or f"Customer_{msisdn[-4:]}"
        carrier = act_events[0]["carrier"]
    else:
        msisdn_age_days = 30 # default
        customer_name = f"Customer_{msisdn[-4:]}"
        carrier = user_events[0]["carrier"]
        
    # 2. Port Frequency 30d
    port_events = [x for x in user_events if x["event_type"] == "porting"]
    recent_ports = [x for x in port_events if (time.time() - x["timestamp"]) <= 86400 * 30]
    port_frequency_30d = len(recent_ports)
    
    # 3. Activation Recency (hours since last activation/device update)
    device_events = [x for x in user_events if x["event_type"] in ["activation", "device_update"]]
    if device_events:
        newest_dev = max(x["timestamp"] for x in device_events)
        activation_recency_hours = max(0.0, (time.time() - newest_dev) / 3600)
    else:
        activation_recency_hours = 999.0
        
    # 4. Device Churn Count (number of unique IMEIs)
    imeis = {x["imei"] for x in user_events if x["imei"]}
    device_churn_count = len(imeis)
    
    # 5. Fraud Exchange Matches
    blacklist_events = [x for x in user_events if x["event_type"] == "fraud_exchange_hit"]
    fraud_exchange_matches = len(blacklist_events)
    
    # 6. Network Fraud Ring Size (number of other MSISDNs sharing any of this user's IMEIs)
    network_fraud_ring_size = 0
    if imeis:
        with state.lock:
            # Find all other clean silver records using any of these IMEIs
            other_users = {
                x["msisdn"] for x in state.silver
                if x["imei"] in imeis and x["msisdn"] != msisdn and x.get("dq_passed") == True
            }
            network_fraud_ring_size = len(other_users)

    features = {
        "msisdn": msisdn,
        "customer_name": customer_name,
        "carrier": carrier,
        "msisdn_age_days": msisdn_age_days,
        "port_frequency_30d": port_frequency_30d,
        "activation_recency_hours": round(activation_recency_hours, 2),
        "device_churn_count": device_churn_count,
        "fraud_exchange_matches": fraud_exchange_matches,
        "network_fraud_ring_size": network_fraud_ring_size,
        "last_update_time": time.time()
    }
    return features

def json_get(json_str: str, key: str) -> Any:
    try:
        return json.loads(json_str).get(key)
    except:
        return None

def mark_dirty(msisdn: str):
    """Flags MSISDN as dirty for feature & score recalculation"""
    if msisdn:
        with state.lock:
            state.dirty_entities.add(msisdn)

def recompute_dirty_entities() -> int:
    """
    Processes all dirty flags:
    1. Recomputes features and saves to Online Feature Store.
    2. Updates the Gold dataset (OLAP).
    3. Re-scores the entity and updates cache.
    """
    from app.scoring import score_msisdn
    
    with state.lock:
        dirty_list = list(state.dirty_entities)
        
    if not dirty_list:
        return 0
        
    features_to_save = []
    
    for msisdn in dirty_list:
        # Compute online features
        feats = compute_features_for_msisdn(msisdn)
        
        # Save in-memory online feature store
        with state.lock:
            state.online_feature_store[msisdn] = feats
            
        features_to_save.append(feats)
        
        # Rescore and update cache
        score_msisdn(msisdn)
        
    # Write aggregated profiles to Gold (Redshift/SQLite)
    if features_to_save:
        gold_df = pd.DataFrame(features_to_save)
        write_to_gold(gold_df)
        
    # Clear dirty flags
    with state.lock:
        for msisdn in dirty_list:
            state.dirty_entities.discard(msisdn)
            
    return len(dirty_list)
