import asyncio
import json
import time
import queue
import threading
from fastapi import FastAPI, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any

from app.state import state
from app.seed import seed_initial_data
from app.medallion import process_bronze_to_silver, get_gold_record
from app.features import recompute_dirty_entities, mark_dirty
from app.scoring import score_msisdn
from app.ingestion import (
    generate_random_simulation_event,
    simulate_carrier_event,
    simulate_transunion_porting,
    simulate_mysql_client_change,
    simulate_sftp_blacklist_upload
)
from app.models import promote_model, rollback_model, run_mlops_training_pipeline, calculate_drift_metrics

app = FastAPI(title="EnStream Fraud Intelligence API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class RescoreRequest(BaseModel):
    msisdn: str

class SimulateEventRequest(BaseModel):
    source: str
    event_type: str
    msisdn: str
    imei: str = None
    source_carrier: str = None
    target_carrier: str = None
    reason: str = None
    customer_name: str = None

class PromoteRequest(BaseModel):
    version: str

# Cross-Sector Exchange Request Models
class ExchangeSubmitRequest(BaseModel):
    participant_id: str
    msisdn: str
    imei: str = None
    pii_name: str = None
    pii_email: str = None
    pii_address: str = None
    pii_ip_address: str = None
    fraud_type: str
    source: str
    fraud_event_ts: float = None

class ExchangeLookupRequest(BaseModel):
    participant_id: str
    msisdn: str
    imei: str = None
    pii_name: str = None
    pii_address: str = None
    pii_email: str = None
    pii_ip_address: str = None

class ExchangeCorrectRequest(BaseModel):
    participant_id: str
    record_id: str
    reason: str
    record_status: str

# Helper to send event to SSE clients
def broadcast_sse(event_type: str, data: Dict[str, Any]):
    message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    # Filter active listeners
    active_listeners = []
    for q in state.sse_listeners:
        try:
            q.put_nowait(message)
            active_listeners.append(q)
        except Exception:
            pass
    state.sse_listeners = active_listeners

# Background loop for continuous simulation
def run_simulation_loop():
    print("Simulation: Background loop started.")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    while True:
        if state.simulation_active:
            try:
                # 1. Generate a random event on the Kafka-style bus
                raw_rec = generate_random_simulation_event()
                msisdn = raw_rec["msisdn"]
                source = raw_rec["source"]
                
                broadcast_sse("kafka_event", {
                    "event_id": raw_rec["event_id"],
                    "event_type": raw_rec["event_type"],
                    "msisdn": msisdn,
                    "source": source,
                    "timestamp": time.time()
                })
                
                # 2. Wait a split second to simulate network processing
                time.sleep(0.5)
                
                # 3. Process Bronze to Silver (runs schema/DQ validation)
                silver_recs = process_bronze_to_silver()
                for silver in silver_recs:
                    errors = json.loads(silver["dq_errors"])
                    broadcast_sse("silver_processed", {
                        "event_id": silver["event_id"],
                        "msisdn": silver["msisdn"],
                        "dq_passed": silver["dq_passed"],
                        "dq_errors": errors,
                        "timestamp": time.time()
                    })
                    
                    if silver["dq_passed"]:
                        # 4. Trigger Dirty Flag selective recompute
                        mark_dirty(silver["msisdn"])
                        broadcast_sse("dirty_flag", {
                            "msisdn": silver["msisdn"],
                            "timestamp": time.time()
                        })
                
                # 5. Run recomputations on dirty entities
                recomputed = recompute_dirty_entities()
                if recomputed > 0:
                    for silver in silver_recs:
                        if silver["dq_passed"]:
                            msisdn = silver["msisdn"]
                            with state.lock:
                                feat_store = state.online_feature_store.get(msisdn, {})
                                score = state.score_cache.get(msisdn, {})
                            
                            broadcast_sse("score_refreshed", {
                                "msisdn": msisdn,
                                "features": feat_store,
                                "score": score,
                                "timestamp": time.time()
                            })
                            
                # Calculate drifts occasionally
                calculate_drift_metrics()
                
            except Exception as e:
                print(f"Simulation Loop Error: {e}")
                
        time.sleep(max(1.0, state.simulation_speed))

# Startup Event: Seed data and boot background thread
@app.on_event("startup")
def startup_event():
    seed_initial_data()
    process_bronze_to_silver()
    with state.lock:
        msisdns = {x["msisdn"] for x in state.silver if x.get("msisdn")}
    for m in msisdns:
        mark_dirty(m)
    recompute_dirty_entities()
    
    # Start thread
    thread = threading.Thread(target=run_simulation_loop, daemon=True)
    thread.start()

# API Routes
@app.get("/api/score/{msisdn}")
def get_score(msisdn: str):
    """Fetches the score details for a specific MSISDN"""
    with state.lock:
        res = state.score_cache.get(msisdn)
        
    if not res:
        res = score_msisdn(msisdn)
        
    return res

@app.get("/api/entity/{msisdn}")
def get_entity_details(msisdn: str):
    """Fetches complete entity profile (Bronze, Silver, Gold, Features, Score)"""
    with state.lock:
        bronze_events = [x for x in state.bronze if x.get("msisdn") == msisdn]
        silver_events = [x for x in state.silver if x.get("msisdn") == msisdn]
        features = state.online_feature_store.get(msisdn, {})
        score = state.score_cache.get(msisdn, {})
        
    gold = get_gold_record(msisdn)
    
    return {
        "msisdn": msisdn,
        "features": features,
        "score": score,
        "gold": gold,
        "bronze_events": bronze_events,
        "silver_events": silver_events,
        "dirty_flag": msisdn in state.dirty_entities
    }

@app.post("/api/rescore")
def rescore_entity(req: RescoreRequest):
    """Triggers a manual rescore (bypasses dirty flag scheduler)"""
    mark_dirty(req.msisdn)
    recompute_dirty_entities()
    with state.lock:
        score = state.score_cache.get(req.msisdn)
    return score

@app.post("/api/simulate-event")
def post_event(req: SimulateEventRequest, background_tasks: BackgroundTasks):
    """Simulates manual injection of event into Kafka event stream"""
    src = req.source.lower()
    
    if req.event_type == "activation":
        rec = simulate_carrier_event(src, req.msisdn, "activation", req.imei)
    elif req.event_type == "porting":
        rec = simulate_transunion_porting(req.msisdn, req.source_carrier, req.target_carrier)
    elif req.event_type == "customer_update":
        rec = simulate_mysql_client_change(req.msisdn, req.customer_name)
    elif req.event_type == "fraud_exchange_hit":
        rec = simulate_sftp_blacklist_upload(req.msisdn, req.reason or "identity_theft")
    else:
        rec = simulate_carrier_event(src, req.msisdn, req.event_type, req.imei)
        
    def process_step():
        time.sleep(0.5)
        silver_recs = process_bronze_to_silver()
        for silver in silver_recs:
            if silver["event_id"] == rec["event_id"]:
                broadcast_sse("silver_processed", {
                    "event_id": silver["event_id"],
                    "msisdn": silver["msisdn"],
                    "dq_passed": silver["dq_passed"],
                    "dq_errors": json.loads(silver["dq_errors"]),
                    "timestamp": time.time()
                })
                if silver["dq_passed"]:
                    mark_dirty(silver["msisdn"])
                    recompute_dirty_entities()
                    with state.lock:
                        feat_store = state.online_feature_store.get(silver["msisdn"], {})
                        score = state.score_cache.get(silver["msisdn"], {})
                    broadcast_sse("score_refreshed", {
                        "msisdn": silver["msisdn"],
                        "features": feat_store,
                        "score": score,
                        "timestamp": time.time()
                    })

    background_tasks.add_task(process_step)
    
    # Broadcast raw event immediately
    broadcast_sse("kafka_event", {
        "event_id": rec["event_id"],
        "event_type": rec["event_type"],
        "msisdn": req.msisdn,
        "source": src,
        "timestamp": time.time()
    })
    
    return rec

@app.get("/api/state")
def get_dashboard_state():
    """Gets the aggregated state for frontend console metrics"""
    with state.lock:
        bronze_count = len(state.bronze)
        silver_count = len(state.silver)
        gold_count = len(state.gold)
        features_count = len(state.online_feature_store)
        
        # Suspects list (ordered by highest fraud probability / lowest trust)
        high_risk_entities = []
        for msisdn, score_info in state.score_cache.items():
            if score_info.get("trust_score", 100) < 50:
                high_risk_entities.append(score_info)
        high_risk_entities = sorted(high_risk_entities, key=lambda x: x["trust_score"])
        
        state_dump = {
            "medallion_stats": {
                "bronze_rows": bronze_count,
                "silver_rows": silver_count,
                "gold_rows": gold_count,
                "online_features_count": features_count,
                "dirty_entities_count": len(state.dirty_entities)
            },
            "ingestion_status": state.ingestion_status,
            "model_registry": state.model_registry,
            "pipeline_runs": state.pipeline_runs,
            "drift_metrics": state.drift_metrics,
            "dq_summary": state.dq_summary,
            "high_risk_entities": high_risk_entities[:15],
            "simulation": {
                "active": state.simulation_active,
                "speed": state.simulation_speed
            }
        }
    return state_dump

@app.post("/api/model/promote")
def promote(req: PromoteRequest):
    """Promotes a model version to Champion in the registry"""
    success = promote_model(req.version)
    if success:
        with state.lock:
            active_msisdns = list(state.online_feature_store.keys())
        for m in active_msisdns:
            mark_dirty(m)
        recompute_dirty_entities()
        return {"status": "success", "message": f"Model {req.version} promoted to Champion."}
    return {"status": "error", "message": "Model version not found."}

@app.post("/api/model/rollback")
def rollback(req: PromoteRequest):
    """Rolls back the Champion model in the registry"""
    success = rollback_model(req.version)
    if success:
        with state.lock:
            active_msisdns = list(state.online_feature_store.keys())
        for m in active_msisdns:
            mark_dirty(m)
        recompute_dirty_entities()
        return {"status": "success", "message": f"Model rolled back to {req.version}."}
    return {"status": "error", "message": "Model version not found."}

@app.post("/api/mlops/train")
def train_model(background_tasks: BackgroundTasks):
    """Triggers ML training pipeline in the background"""
    background_tasks.add_task(run_mlops_training_pipeline)
    return {"status": "success", "message": "Training pipeline initiated in background."}

@app.post("/api/simulation/toggle")
def toggle_simulation():
    """Toggles simulated event bus stream on/off"""
    state.simulation_active = not state.simulation_active
    return {"active": state.simulation_active}

@app.post("/api/simulation/speed")
def update_simulation_speed(speed: float):
    """Sets simulated event delivery speed in seconds"""
    state.simulation_speed = max(1.0, speed)
    return {"speed": state.simulation_speed}

@app.get("/api/data/metadata/{table_name}")
def get_table_metadata(table_name: str):
    """Fetches the latest Apache Iceberg metadata JSON file contents"""
    import os
    from app.medallion import WAREHOUSE_PATH, USE_S3, s3_fs
    clean_name = table_name.replace("enstream.", "")
    if clean_name not in ["bronze", "silver"]:
        return {"error": "Invalid table name"}
        
    metadata_dir = f"enstream/{clean_name}/metadata"
    version_hint_path = f"{WAREHOUSE_PATH}/{metadata_dir}/version-hint.text"
    
    try:
        if USE_S3:
            if s3_fs.exists(version_hint_path):
                with s3_fs.open(version_hint_path, "r") as fh:
                    version = fh.read().strip()
                metadata_path = f"{WAREHOUSE_PATH}/{metadata_dir}/v{version}.metadata.json"
                with s3_fs.open(metadata_path, "r") as fh:
                    return json.load(fh)
        else:
            if os.path.exists(version_hint_path):
                with open(version_hint_path, "r") as fh:
                    version = fh.read().strip()
                metadata_path = f"{WAREHOUSE_PATH}/{metadata_dir}/v{version}.metadata.json"
                with open(metadata_path, "r") as rfh:
                    return json.load(rfh)
    except Exception as e:
        return {"error": f"Failed to load metadata: {e}"}
        
    return {"error": "No metadata found"}

@app.get("/api/data/bronze")
def get_bronze_data(limit: int = 50):
    """Returns the most recent rows from the Bronze Iceberg Table"""
    with state.lock:
        data = list(state.bronze[-limit:])
    return data

@app.get("/api/data/silver")
def get_silver_data(limit: int = 50):
    """Returns the most recent rows from the Silver Iceberg Table"""
    with state.lock:
        data = list(state.silver[-limit:])
    return data

@app.get("/api/data/gold")
def get_gold_data(limit: int = 50):
    """Returns the most recent rows from the Gold Redshift Table"""
    with state.lock:
        data = list(state.gold.values())[:limit]
    return data

@app.get("/api/stream")
def sse_event_stream(request: Request):
    """Server-Sent Events streaming endpoint for real-time dashboards"""
    
    async def message_generator():
        q = queue.Queue()
        state.sse_listeners.append(q)
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = q.get_nowait()
                    yield msg
                except queue.Empty:
                    await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            pass
        finally:
            if q in state.sse_listeners:
                state.sse_listeners.remove(q)

    return StreamingResponse(message_generator(), media_type="text/event-stream")

# --- CROSS-SECTOR DATA EXCHANGE ENDPOINTS ---
import uuid
import re

@app.get("/api/exchange/state")
def get_exchange_state():
    with state.lock:
        return {
            "stats": {
                "total_records": len([x for x in state.exchange_records if x["record_status"] == "active"]),
                "total_submissions": len(state.exchange_submissions),
                "total_lookups": state.exchange_lookup_count,
                "total_corrections": len(state.exchange_corrections)
            },
            "participants": list(state.exchange_participants.values()),
            "records": state.exchange_records
        }

@app.post("/api/exchange/submit")
def submit_exchange_record(req: ExchangeSubmitRequest):
    import time
    with state.lock:
        part = state.exchange_participants.get(req.participant_id)
        if not part or part["participant_status"] != "active" or not part["submission_enabled"]:
            return {"status": "rejected", "error": "Participant is not active or unauthorized for submission"}
        
        # Validation 1: E.164 MSISDN format check (must start with + followed by 10-15 digits)
        e164_pattern = re.compile(r"^\+\d{10,15}$")
        if not e164_pattern.match(req.msisdn):
            # Log as quarantined submission
            file_uuid = str(uuid.uuid4())
            state.exchange_submissions.append({
                "file_id": file_uuid,
                "source_name": f"{req.participant_id.lower()}_sftp",
                "source_type": part["submission_channel"],
                "participant_id": req.participant_id,
                "received_ts": time.time(),
                "parse_status": "quarantined",
                "record_count": 0,
                "quarantine_reason": "INVALID_PHONE_FORMAT",
                "created_ts": time.time()
            })
            return {
                "status": "rejected",
                "error": "MSISDN must follow E.164 phone format (e.g. +14165550199)",
                "file_id": file_uuid
            }
            
        # Validation 2: Predefined Fraud Taxonomy check
        allowed_types = ["synthetic_id", "first_party_fraud", "impersonation", "account_takeover", "sim_swap", "account_opening_fraud"]
        if req.fraud_type not in allowed_types:
            file_uuid = str(uuid.uuid4())
            state.exchange_submissions.append({
                "file_id": file_uuid,
                "source_name": f"{req.participant_id.lower()}_sftp",
                "source_type": part["submission_channel"],
                "participant_id": req.participant_id,
                "received_ts": time.time(),
                "parse_status": "quarantined",
                "record_count": 0,
                "quarantine_reason": "INVALID_TAXONOMY_CODE",
                "created_ts": time.time()
            })
            return {
                "status": "rejected",
                "error": f"Fraud type must match predefined taxonomy: {', '.join(allowed_types)}",
                "file_id": file_uuid
            }
            
        # Deduplication: check if same active record already exists from same submitter
        is_duplicate = False
        for rec in state.exchange_records:
            if rec["msisdn"] == req.msisdn and rec["fraud_type"] == req.fraud_type and rec["participant_id"] == req.participant_id and rec["record_status"] == "active":
                is_duplicate = True
                break
                
        if is_duplicate:
            return {"status": "duplicate", "message": "Record already exists with active status, de-duplicated."}
            
        # Success path: build conformed record
        rec_uuid = str(uuid.uuid4())
        file_uuid = str(uuid.uuid4())
        
        new_record = {
            "record_id": rec_uuid,
            "file_id": file_uuid,
            "participant_id": req.participant_id,
            "msisdn": req.msisdn,
            "imei": req.imei,
            "pii_name": req.pii_name,
            "pii_email": req.pii_email,
            "pii_address": req.pii_address,
            "pii_ip_address": req.pii_ip_address,
            "fraud_type": req.fraud_type,
            "fraud_event_ts": req.fraud_event_ts or time.time(),
            "source": req.source,
            "record_status": "active",
            "dq_status": "passed",
            "created_ts": time.time(),
            "updated_ts": time.time(),
            "ownership_status": "Owned",
            "ownership_status_ts": time.time()
        }
        
        state.exchange_records.append(new_record)
        
        # Log successful submission
        state.exchange_submissions.append({
            "file_id": file_uuid,
            "source_name": f"{req.participant_id.lower()}_sftp" if part["submission_channel"] == "bank_sftp" else f"{req.participant_id.lower()}_s3",
            "source_type": part["submission_channel"],
            "participant_id": req.participant_id,
            "received_ts": time.time(),
            "parse_status": "parsed",
            "record_count": 1,
            "quarantine_reason": None,
            "created_ts": time.time()
        })
        
        return {"status": "accepted", "record": new_record}

@app.post("/api/exchange/lookup")
def lookup_exchange_record(req: ExchangeLookupRequest):
    import time
    with state.lock:
        part = state.exchange_participants.get(req.participant_id)
        if not part or part["participant_status"] != "active" or not part["lookup_enabled"]:
            return Response(status_code=403, content=json.dumps({"error": "Access Denied: Participant is suspended or inactive"}))
            
        state.exchange_lookup_count += 1
        
        # Search matching active records
        matches = []
        for rec in state.exchange_records:
            if rec["record_status"] != "active":
                continue
            
            msisdn_match = rec["msisdn"] == req.msisdn
            imei_match = req.imei and rec["imei"] == req.imei
            
            if msisdn_match or imei_match:
                matches.append(rec)
                
        phone_match = any(rec["msisdn"] == req.msisdn for rec in matches)
        imei_match = any(req.imei and rec["imei"] == req.imei for rec in matches)
        
        # Simulated MNO APIs: check if MSISDN has been recycled
        # Recycled check: if the msisdn is recycled, we flag it. E.g. simulated recycled flag if ends in '1234'
        is_recycled = req.msisdn.endswith("1234") or req.msisdn == "+14165551234"
        recycle_status = "RECYCLED" if is_recycled else "OWNED"
        
        # Assemble matches lists
        matches_phone = []
        matches_imei = []
        institutions = set()
        sectors = set()
        latest_ts = 0.0
        
        for r in matches:
            institutions.add(r["participant_id"])
            p_obj = state.exchange_participants.get(r["participant_id"], {})
            sectors.add(p_obj.get("sector", "unknown").upper())
            if r["fraud_event_ts"] > latest_ts:
                latest_ts = r["fraud_event_ts"]
                
            # Calculate PII score
            identity_avail = bool(r["pii_name"])
            name_score = 0
            addr_score = 0
            if identity_avail and req.pii_name:
                if req.pii_name.lower() == r["pii_name"].lower():
                    name_score = 100
                elif req.pii_name.lower() in r["pii_name"].lower() or r["pii_name"].lower() in req.pii_name.lower():
                    name_score = 85
                    
            if identity_avail and req.pii_address and r["pii_address"]:
                if req.pii_address.lower() == r["pii_address"].lower():
                    addr_score = 100
                elif req.pii_address.lower()[:10] in r["pii_address"].lower() or r["pii_address"].lower()[:10] in req.pii_address.lower():
                    addr_score = 75
            
            # Format output matching slide schema
            res_item = {
                "record_id": r["record_id"],
                "source_sector": p_obj.get("sector", "unknown").upper(),
                "source_institution": p_obj.get("display_name", r["participant_id"]),
                "fraud_type": r["fraud_type"].upper(),
                "fraud_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(r["fraud_event_ts"])),
                "status": r["record_status"].upper(),
                "identity_match": {
                    "identity_data_available": identity_avail,
                    "first_name": {"provided": req.pii_name or "", "score": name_score},
                    "last_name": {"provided": "", "score": name_score},
                    "address": {"provided": req.pii_address or "", "score": addr_score}
                }
            }
            
            if r["msisdn"] == req.msisdn:
                matches_phone.append(res_item)
            else:
                matches_imei.append(res_item)
                
        # Audit Log lookup request
        corr_id = str(uuid.uuid4())
        state.exchange_lookups.append({
            "lookup_id": str(uuid.uuid4()),
            "participant_id": req.participant_id,
            "request_msisdn": req.msisdn,
            "phone_number_match": phone_match,
            "imei_match": imei_match,
            "request_imei": req.imei,
            "request_as_of_ts": None,
            "request_ts": time.time(),
            "response_payload": json.dumps({"phone_match": phone_match, "imei_match": imei_match, "matches_count": len(matches)}),
            "response_ts": time.time() + 0.05,
            "correlation_id": corr_id
        })
        
        response_payload = {
            "query": {
                "lookup_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "phone_number": req.msisdn,
                "imei": req.imei or "",
                "input_data": {
                    "first_name": req.pii_name or "",
                    "last_name": "",
                    "address": req.pii_address or ""
                }
            },
            "match_summary": {
                "phone_number_match": phone_match,
                "imei_match": imei_match,
                "match_count": len(matches),
                "latest_fraud_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(latest_ts)) if latest_ts > 0 else None,
                "source_institution_count": len(institutions),
                "source_sector_count": len(sectors)
            },
            "phone_number_result": {
                "match": phone_match,
                "recycled_status": {
                    "record_fraud_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(latest_ts)) if latest_ts > 0 else None,
                    "recycle_check_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "recycle_status": recycle_status
                },
                "matches": matches_phone
            },
            "imei_result": {
                "match": imei_match,
                "matches": matches_imei
            }
        }
        
        return response_payload

@app.post("/api/exchange/correct")
def correct_exchange_record(req: ExchangeCorrectRequest):
    import time
    with state.lock:
        # Check authorization
        part = state.exchange_participants.get(req.participant_id)
        if not part or part["participant_status"] != "active":
            return {"status": "error", "message": "Unauthorized participant"}
            
        record = None
        for r in state.exchange_records:
            if r["record_id"] == req.record_id:
                record = r
                break
                
        if not record:
            return {"status": "error", "message": "Record not found"}
            
        old_status = record["record_status"]
        record["record_status"] = req.record_status
        record["updated_ts"] = time.time()
        
        # GDPR/PIPEDA compliance: delete PII data within 30 days (simulate immediate purge)
        if req.record_status in ["withdrawn", "cleared"]:
            record["pii_name"] = "<purged>"
            record["pii_email"] = "<purged>"
            record["pii_address"] = "<purged>"
            record["pii_ip_address"] = "<purged>"
            
        # Log correction audit trail
        state.exchange_corrections.append({
            "correction_id": str(uuid.uuid4()),
            "participant_id": req.participant_id,
            "record_id": req.record_id,
            "reason": req.reason,
            "requested_ts": time.time(),
            "applied_ts": time.time(),
            "change_diff": json.dumps({"record_status": {"before": old_status, "after": req.record_status}})
        })
        
        return {"status": "success", "record": record}

@app.get("/api/exchange/logs")
def get_exchange_logs():
    with state.lock:
        onboarding_logs = []
        for p in state.exchange_participants.values():
            onboarding_logs.append({
                "institution_name": p["display_name"],
                "sector": p["sector"],
                "time_of_onboarding": p["activated_ts"],
                "records_successfully_uploaded": len([x for x in state.exchange_records if x["participant_id"] == p["participant_id"]])
            })
            
        return {
            "onboarding": onboarding_logs,
            "submissions": state.exchange_submissions,
            "corrections": state.exchange_corrections,
            "lookups": state.exchange_lookups
        }

# Mount frontend production build files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException
import os

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        # Serve root-level static files from public directory (e.g. images, favicon, icons)
        file_path = os.path.join(frontend_dist, catchall)
        if catchall and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

