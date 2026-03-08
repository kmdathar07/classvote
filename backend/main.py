from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import os

from routers import rooms, users, votes, questions
from services.connection_manager import ConnectionManager


app = FastAPI(
    title="ClassVote API",
    description="Real-Time Classroom Voting Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
manager = ConnectionManager()

# Include API routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(votes.router, prefix="/api/votes", tags=["Votes"])


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ClassVote API is running 🎓",
        "version": "1.0.0"
    }


# WebSocket endpoint
@app.websocket("/ws/{room_code}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, user_id: str):
    await manager.connect(websocket, room_code, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            event_type = message.get("type")

            if event_type == "vote":
                await manager.broadcast_to_room(
                    room_code,
                    {
                        "type": "vote_update",
                        "payload": message.get("payload")
                    }
                )

            elif event_type == "reaction":
                await manager.broadcast_to_room(
                    room_code,
                    {
                        "type": "reaction",
                        "payload": {
                            "user_id": user_id,
                            "reaction": message.get("payload", {}).get("reaction")
                        }
                    }
                )

            elif event_type == "participant_joined":
                await manager.broadcast_to_room(
                    room_code,
                    {
                        "type": "participant_update",
                        "payload": {
                            "count": manager.get_room_count(room_code)
                        }
                    }
                )

            elif event_type == "ping":
                await websocket.send_text(
                    json.dumps({"type": "pong"})
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code, user_id)

        await manager.broadcast_to_room(
            room_code,
            {
                "type": "participant_update",
                "payload": {
                    "count": manager.get_room_count(room_code)
                }
            }
        )


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }