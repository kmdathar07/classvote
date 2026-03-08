from fastapi import WebSocket
from typing import Dict, List, Set
import json
import asyncio


class ConnectionManager:
    def __init__(self):
        # room_code -> list of (websocket, user_id)
        self.active_connections: Dict[str, List[tuple]] = {}

    async def connect(self, websocket: WebSocket, room_code: str, user_id: str):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append((websocket, user_id))

    def disconnect(self, websocket: WebSocket, room_code: str, user_id: str):
        if room_code in self.active_connections:
            self.active_connections[room_code] = [
                (ws, uid) for ws, uid in self.active_connections[room_code]
                if ws != websocket
            ]
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast_to_room(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            dead_connections = []
            for websocket, user_id in self.active_connections[room_code]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception:
                    dead_connections.append((websocket, user_id))
            for ws, uid in dead_connections:
                self.disconnect(ws, room_code, uid)

    def get_room_count(self, room_code: str) -> int:
        return len(self.active_connections.get(room_code, []))

    def get_room_users(self, room_code: str) -> List[str]:
        return [uid for _, uid in self.active_connections.get(room_code, [])]
