import time
import random
from app.state import state

def seed_initial_data():
    with state.lock:
        state.bronze.clear()
        state.silver.clear()
        state.gold.clear()
        state.online_feature_store.clear()
        state.score_cache.clear()
        
        print("Seeding initial data...")
        
        # 1. Create 50 legitimate subscribers
        carriers = ["bell", "rogers", "telus"]
        for i in range(50):
            msisdn = f"1416555{100 + i:04d}"
            carrier = carriers[i % 3]
            imei = f"35890104{random.randint(100000, 999999)}"
            activation_time = time.time() - 86400 * random.randint(100, 1000)
            
            # Activation Event
            act_event = {
                "event_id": f"act_{msisdn}_{int(activation_time)}",
                "event_type": "activation",
                "msisdn": msisdn,
                "carrier": carrier,
                "imei": imei,
                "timestamp": activation_time,
                "billing_address": f"{random.randint(10, 999)} Bay St, Toronto, ON",
                "customer_name": f"Sub_{i}"
            }
            # Put in bronze and silver (assume clean)
            state.bronze.append({
                "event_id": act_event["event_id"],
                "event_type": act_event["event_type"],
                "msisdn": msisdn,
                "payload": json_serialize(act_event),
                "source": carrier,
                "ingested_at": activation_time
            })
            state.silver.append({
                "event_id": act_event["event_id"],
                "event_type": act_event["event_type"],
                "msisdn": msisdn,
                "carrier": carrier,
                "imei": imei,
                "timestamp": activation_time,
                "validated_at": activation_time + 1,
                "dq_passed": True,
                "dq_errors": "[]",
                "normalized_payload": json_serialize(act_event)
            })
            
        # 2. Create high-risk and fraud scenarios
        # Scenario A: SIM Swapper / Porting Looper (MSISDN: 14165559001)
        msisdn_swapper = "14165559001"
        imeis = [f"86029304{100000 + k}" for k in range(5)]
        
        # Original Activation
        act_event = {
            "event_id": f"act_{msisdn_swapper}_old",
            "event_type": "activation",
            "msisdn": msisdn_swapper,
            "carrier": "rogers",
            "imei": imeis[0],
            "timestamp": time.time() - 86400 * 365,
            "billing_address": "456 Yonge St, Toronto, ON",
            "customer_name": "John Swapper"
        }
        state.bronze.append({
            "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": msisdn_swapper,
            "payload": json_serialize(act_event), "source": "rogers", "ingested_at": act_event["timestamp"]
        })
        state.silver.append({
            "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": msisdn_swapper,
            "carrier": "rogers", "imei": imeis[0], "timestamp": act_event["timestamp"],
            "validated_at": act_event["timestamp"] + 1, "dq_passed": True, "dq_errors": "[]",
            "normalized_payload": json_serialize(act_event)
        })
        
        # Recent Portings & SIM swaps (Bell -> Telus -> Rogers, etc. in last 10 days)
        for k in range(1, 4):
            port_time = time.time() - 86400 * (10 - k * 2)
            port_event = {
                "event_id": f"port_{msisdn_swapper}_{k}",
                "event_type": "porting",
                "msisdn": msisdn_swapper,
                "source_carrier": "rogers" if k % 2 == 0 else "bell",
                "target_carrier": "bell" if k % 2 == 0 else "telus",
                "timestamp": port_time,
                "request_id": f"tu_port_req_{k}_{random.randint(1000, 9999)}"
            }
            sim_event = {
                "event_id": f"sim_{msisdn_swapper}_{k}",
                "event_type": "device_update",
                "msisdn": msisdn_swapper,
                "carrier": port_event["target_carrier"],
                "imei": imeis[k],
                "timestamp": port_time + 60,
                "update_reason": "SIM swap"
            }
            
            state.bronze.append({
                "event_id": port_event["event_id"], "event_type": port_event["event_type"], "msisdn": msisdn_swapper,
                "payload": json_serialize(port_event), "source": "transunion", "ingested_at": port_time
            })
            state.silver.append({
                "event_id": port_event["event_id"], "event_type": port_event["event_type"], "msisdn": msisdn_swapper,
                "carrier": port_event["target_carrier"], "imei": "", "timestamp": port_time,
                "validated_at": port_time + 1, "dq_passed": True, "dq_errors": "[]",
                "normalized_payload": json_serialize(port_event)
            })
            
            state.bronze.append({
                "event_id": sim_event["event_id"], "event_type": sim_event["event_type"], "msisdn": msisdn_swapper,
                "payload": json_serialize(sim_event), "source": port_event["target_carrier"], "ingested_at": port_time + 60
            })
            state.silver.append({
                "event_id": sim_event["event_id"], "event_type": sim_event["event_type"], "msisdn": msisdn_swapper,
                "carrier": port_event["target_carrier"], "imei": imeis[k], "timestamp": port_time + 60,
                "validated_at": port_time + 61, "dq_passed": True, "dq_errors": "[]",
                "normalized_payload": json_serialize(sim_event)
            })

        # Scenario B: Known Blacklisted Customer (MSISDN: 14165559002)
        msisdn_blacklisted = "14165559002"
        act_event = {
            "event_id": f"act_{msisdn_blacklisted}",
            "event_type": "activation",
            "msisdn": msisdn_blacklisted,
            "carrier": "bell",
            "imei": "35890104888888",
            "timestamp": time.time() - 86400 * 200,
            "billing_address": "789 Queen St, Toronto, ON",
            "customer_name": "Blacklist Match"
        }
        state.bronze.append({
            "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": msisdn_blacklisted,
            "payload": json_serialize(act_event), "source": "bell", "ingested_at": act_event["timestamp"]
        })
        state.silver.append({
            "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": msisdn_blacklisted,
            "carrier": "bell", "imei": "35890104888888", "timestamp": act_event["timestamp"],
            "validated_at": act_event["timestamp"] + 1, "dq_passed": True, "dq_errors": "[]",
            "normalized_payload": json_serialize(act_event)
        })
        
        # Fraud exchange record
        fraud_rec = {
            "event_id": f"fe_{msisdn_blacklisted}",
            "event_type": "fraud_exchange_hit",
            "msisdn": msisdn_blacklisted,
            "reported_date": time.time() - 86400 * 5,
            "reported_by": "TD Bank",
            "confidence_score": 0.95
        }
        state.bronze.append({
            "event_id": fraud_rec["event_id"], "event_type": fraud_rec["event_type"], "msisdn": msisdn_blacklisted,
            "payload": json_serialize(fraud_rec), "source": "sftp", "ingested_at": fraud_rec["reported_date"]
        })
        state.silver.append({
            "event_id": fraud_rec["event_id"], "event_type": fraud_rec["event_type"], "msisdn": msisdn_blacklisted,
            "carrier": "bell", "imei": "", "timestamp": fraud_rec["reported_date"],
            "validated_at": fraud_rec["reported_date"] + 1, "dq_passed": True, "dq_errors": "[]",
            "normalized_payload": json_serialize(fraud_rec)
        })

        # Scenario C: Fraud Ring (MSISDNs sharing same IMEI/Device)
        shared_imei = "35991104111222"
        ring_msisdns = ["14165559011", "14165559012", "14165559013"]
        for idx, r_msisdn in enumerate(ring_msisdns):
            act_event = {
                "event_id": f"act_ring_{r_msisdn}",
                "event_type": "activation",
                "msisdn": r_msisdn,
                "carrier": "telus",
                "imei": shared_imei,
                "timestamp": time.time() - 86400 * 3 + idx * 3600,
                "billing_address": "12 Ring Rd, Scarborough, ON",
                "customer_name": f"RingMember_{idx}"
            }
            state.bronze.append({
                "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": r_msisdn,
                "payload": json_serialize(act_event), "source": "telus", "ingested_at": act_event["timestamp"]
            })
            state.silver.append({
                "event_id": act_event["event_id"], "event_type": act_event["event_type"], "msisdn": r_msisdn,
                "carrier": "telus", "imei": shared_imei, "timestamp": act_event["timestamp"],
                "validated_at": act_event["timestamp"] + 1, "dq_passed": True, "dq_errors": "[]",
                "normalized_payload": json_serialize(act_event)
            })

        # Seed initial watermarks and counts
        for key in state.ingestion_status:
            state.ingestion_status[key]["rows"] = sum(1 for x in state.bronze if x["source"] == key)
            state.ingestion_status[key]["watermark"] = time.time()
            state.ingestion_status[key]["status"] = "idle"

def json_serialize(obj) -> str:
    import json
    return json.dumps(obj)
