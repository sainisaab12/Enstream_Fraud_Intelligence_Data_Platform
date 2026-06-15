import time
from typing import Tuple, List, Dict, Any
from app.state import state

def run_dq_check(event: Dict[str, Any], source: str) -> Tuple[bool, List[str]]:
    """
    Performs data quality checks.
    Returns (is_valid, list_of_errors)
    """
    errors = []
    
    event_id = event.get("event_id")
    event_type = event.get("event_type")
    msisdn = event.get("msisdn")
    timestamp = event.get("timestamp")
    
    # 1. Schema Validation (types and keys)
    if not event_id or not isinstance(event_id, str):
        errors.append("Schema: 'event_id' is missing or not a string")
        state.dq_summary["failed_by_rule"]["schema_validation"] += 1
        
    if not event_type or not isinstance(event_type, str):
        errors.append("Schema: 'event_type' is missing or not a string")
        state.dq_summary["failed_by_rule"]["schema_validation"] += 1
        
    if msisdn:
        if not isinstance(msisdn, str):
            errors.append("Schema: 'msisdn' must be a string")
            state.dq_summary["failed_by_rule"]["schema_validation"] += 1
        elif not msisdn.isdigit():
            errors.append("Schema: 'msisdn' must contain only digits")
            state.dq_summary["failed_by_rule"]["schema_validation"] += 1
        elif len(msisdn) not in [10, 11]:
            errors.append("Schema: 'msisdn' length must be 10 or 11 digits")
            state.dq_summary["failed_by_rule"]["schema_validation"] += 1

    # 2. Completeness (crucial values check)
    if event_type in ["activation", "device_update", "porting", "fraud_exchange_hit"]:
        if not msisdn:
            errors.append("Completeness: MSISDN is missing in fraud-related transaction")
            state.dq_summary["failed_by_rule"]["completeness"] += 1
            
    if event_type == "activation" and not event.get("imei"):
        errors.append("Completeness: IMEI is missing in carrier activation event")
        state.dq_summary["failed_by_rule"]["completeness"] += 1

    # 3. Uniqueness
    if event_id:
        with state.lock:
            duplicate = any(x.get("event_id") == event_id for x in state.silver)
            if duplicate:
                errors.append(f"Uniqueness: Duplicate event_id '{event_id}' detected")
                state.dq_summary["failed_by_rule"]["uniqueness"] += 1

    # 4. Freshness
    if timestamp:
        current_time = time.time()
        lag = current_time - timestamp
        if lag < 0:
            errors.append(f"Freshness: Event timestamp '{timestamp}' is in the future")
            state.dq_summary["failed_by_rule"]["freshness"] += 1
        elif lag > 86400 * 30: # 30 days old considered too stale for stream
            # Skip historical checks during seeds, apply only to real-time events
            if state.ingestion_status[source]["status"] == "streaming":
                errors.append(f"Freshness: Event is too stale. Lag is {lag:.1f}s")
                state.dq_summary["failed_by_rule"]["freshness"] += 1

    # 5. Referential Integrity
    if event_type == "porting" and msisdn:
        # Check if we have seen an activation or client record for this MSISDN
        with state.lock:
            exists_in_profiles = any(
                x.get("msisdn") == msisdn and x.get("event_type") == "activation"
                for x in state.silver
            )
            if not exists_in_profiles:
                errors.append(f"Referential Integrity: MSISDN '{msisdn}' has no previous activation profile")
                state.dq_summary["failed_by_rule"]["referential_integrity"] += 1

    is_valid = len(errors) == 0
    
    # Update global DQ counts
    state.dq_summary["total_checked"] += 1
    if is_valid:
        state.dq_summary["total_passed"] += 1
    else:
        state.dq_summary["total_failed"] += 1
        # Log to DQ logs
        dq_log_entry = {
            "timestamp": time.time(),
            "event_id": event_id,
            "source": source,
            "event_type": event_type,
            "msisdn": msisdn,
            "errors": errors,
            "raw_payload": event
        }
        state.dq_logs.append(dq_log_entry)
        if len(state.dq_logs) > 200:
            state.dq_logs.pop(0)

    return is_valid, errors
