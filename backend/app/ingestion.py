import time
import random
import uuid
from app.state import state
from app.medallion import write_to_bronze

def simulate_carrier_event(carrier: str, msisdn: str, event_type: str, imei: str = None) -> dict:
    """Simulates carrier API (Bell, Rogers, Telus) SIM updates/activations"""
    carrier = carrier.lower()
    event = {
        "event_id": f"{carrier}_{event_type}_{str(uuid.uuid4())[:8]}",
        "event_type": event_type,
        "msisdn": msisdn,
        "carrier": carrier,
        "imei": imei or f"35890104{random.randint(100000, 999999)}",
        "timestamp": time.time(),
        "billing_address": f"{random.randint(100, 999)} Spadina Ave, Toronto, ON",
        "customer_name": f"Simulated_{carrier.capitalize()}"
    }
    state.ingestion_status[carrier]["status"] = "streaming"
    rec = write_to_bronze(event, carrier)
    state.ingestion_status[carrier]["status"] = "idle"
    return rec

def simulate_transunion_porting(msisdn: str, source_carrier: str, target_carrier: str) -> dict:
    """Simulates TransUnion PortPS API verification event"""
    event = {
        "event_id": f"tu_port_{str(uuid.uuid4())[:8]}",
        "event_type": "porting",
        "msisdn": msisdn,
        "source_carrier": source_carrier,
        "target_carrier": target_carrier,
        "timestamp": time.time(),
        "request_id": f"tu_req_{random.randint(100000, 999999)}"
    }
    state.ingestion_status["transunion"]["status"] = "streaming"
    rec = write_to_bronze(event, "transunion")
    state.ingestion_status["transunion"]["status"] = "idle"
    return rec

def simulate_mysql_client_change(msisdn: str, new_name: str) -> dict:
    """Simulates incremental MySQL binary-log extraction (Customer Profile changes)"""
    event = {
        "event_id": f"mysql_upd_{str(uuid.uuid4())[:8]}",
        "event_type": "customer_update",
        "msisdn": msisdn,
        "customer_name": new_name,
        "timestamp": time.time(),
        "table_src": "customer_master",
        "op": "UPDATE"
    }
    state.ingestion_status["mysql"]["status"] = "streaming"
    rec = write_to_bronze(event, "mysql")
    state.ingestion_status["mysql"]["status"] = "idle"
    return rec

def simulate_sftp_blacklist_upload(msisdn: str, reason: str = "identity_theft") -> dict:
    """Simulates SFTP batch upload from cross-sector fraud database"""
    event = {
        "event_id": f"sftp_hit_{str(uuid.uuid4())[:8]}",
        "event_type": "fraud_exchange_hit",
        "msisdn": msisdn,
        "reported_date": time.time(),
        "reported_by": random.choice(["RBC Bank", "CIBC", "Equifax", "Rogers Fraud Ops"]),
        "confidence_score": round(random.uniform(0.75, 0.99), 2),
        "timestamp": time.time()
    }
    # For compatibility, also map fraud_type
    event["fraud_type"] = reason
    
    state.ingestion_status["sftp"]["status"] = "streaming"
    rec = write_to_bronze(event, "sftp")
    state.ingestion_status["sftp"]["status"] = "idle"
    return rec

def generate_random_simulation_event() -> dict:
    """Generates a random event representing active users in the platform"""
    event_type = random.choice(["carrier_act", "carrier_sim", "porting", "sftp_blacklist"])
    carriers = ["bell", "rogers", "telus"]
    
    # Select or generate an MSISDN
    if random.random() < 0.3:
        # Re-use a known seed MSISDN to simulate updates on active accounts
        msisdn = random.choice(["14165559001", "14165559011", "14165559012"])
    else:
        # Generate new random MSISDN
        msisdn = f"1416555{random.randint(2000, 8999):04d}"
        
    if event_type == "carrier_act":
        carrier = random.choice(carriers)
        return simulate_carrier_event(carrier, msisdn, "activation")
    elif event_type == "carrier_sim":
        carrier = random.choice(carriers)
        return simulate_carrier_event(carrier, msisdn, "device_update", imei=f"35890104{random.randint(100000, 999999)}")
    elif event_type == "porting":
        src = random.choice(carriers)
        tgt = random.choice([x for x in carriers if x != src])
        return simulate_transunion_porting(msisdn, src, tgt)
    else: # sftp_blacklist
        # Only blacklisting target MSISDNs in a small percentage
        return simulate_sftp_blacklist_upload(msisdn, reason=random.choice(["sim_swap_mule", "identity_theft", "sms_phishing"]))
