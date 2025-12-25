from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from database import get_room_state, update_room_state
from connection_manager import ConnectionManager
from youtubesearchpython import VideosSearch 

app = FastAPI()
manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Sync-Song API is running"}

@app.get("/search")
async def search_youtube(q: str = Query(..., min_length=1)):
    try:
        videos_search = VideosSearch(q, limit=5)
        results = videos_search.result()
        
        formatted_results = []
        if results and 'result' in results:
            for video in results['result']:
                formatted_results.append({
                    'title': video['title'],
                    'duration': video.get('duration'),
                    'thumbnail': video['thumbnails'][0]['url'],
                    'url': video['link'],
                    'channel': video['channel']['name']
                })
        return formatted_results
    except Exception:
        return []

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    
    current_state = await get_room_state(room_id)
    
    await websocket.send_json({
        "type": "SYNC_STATE",
        "payload": {
            "url": current_state["url"],
            "is_playing": current_state["is_playing"],
            "timestamp": current_state.get("timestamp", 0)
        }
    })

    try:
        while True:
            data = await websocket.receive_json()
            action_type = data.get("type")
            payload = data.get("payload")

            if action_type == "PLAY":
                await update_room_state(room_id, {"is_playing": True})
                await manager.broadcast({"type": "PLAY"}, room_id, sender_socket=websocket)
                
            elif action_type == "PAUSE":
                await update_room_state(room_id, {"is_playing": False})
                await manager.broadcast({"type": "PAUSE"}, room_id, sender_socket=websocket)
                
            elif action_type == "CHANGE_URL":
                new_url = payload.get("url")
                await update_room_state(room_id, {"url": new_url, "is_playing": True, "timestamp": 0})
                await manager.broadcast({"type": "CHANGE_URL", "payload": payload}, room_id, sender_socket=websocket)

            elif action_type == "SEEK":
                time = payload.get("time")
                await update_room_state(room_id, {"timestamp": time})
                await manager.broadcast({"type": "SEEK", "payload": payload}, room_id, sender_socket=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)