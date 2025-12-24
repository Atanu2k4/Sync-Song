from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Dictionary to hold active connections: { "ROOM_ID": [socket1, socket2] }
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: dict, room_id: str, sender_socket: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                # If sender_socket is None, send to everyone.
                # If sender_socket is provided, skip that specific connection.
                if sender_socket is None or connection != sender_socket:
                    await connection.send_json(message)