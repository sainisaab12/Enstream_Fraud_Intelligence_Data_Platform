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
        return FileResponse(os.path.join(frontend_dist, "index.html"))

