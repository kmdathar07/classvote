from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.database import get_supabase
from datetime import datetime
import uuid
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter()


class VoteCreate(BaseModel):
    user_id: str
    room_code: str
    question_id: str
    option_id: str


class ParticipantJoin(BaseModel):
    user_id: str
    room_code: str


@router.post("/")
async def submit_vote(vote_data: VoteCreate):
    supabase = get_supabase()

    # Get room
    room_result = supabase.table("rooms").select("*").eq("code", vote_data.room_code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")
    room = room_result.data[0]

    if room["status"] != "active":
        raise HTTPException(status_code=400, detail="Room is not active")

    # Check if already voted for this question
    existing = supabase.table("votes").select("id").eq("user_id", vote_data.user_id).eq("question_id", vote_data.question_id).execute()
    if existing.data:
        # Update vote
        result = supabase.table("votes").update({
            "option_id": vote_data.option_id,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", vote_data.user_id).eq("question_id", vote_data.question_id).execute()
        return {"message": "Vote updated", "vote": result.data[0]}

    # Insert new vote
    vote = {
        "id": str(uuid.uuid4()),
        "user_id": vote_data.user_id if not room["anonymous"] else None,
        "room_id": room["id"],
        "question_id": vote_data.question_id,
        "option_id": vote_data.option_id,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("votes").insert(vote).execute()
    return {"message": "Vote submitted", "vote": result.data[0]}


@router.post("/join")
async def join_room(data: ParticipantJoin):
    supabase = get_supabase()
    room_result = supabase.table("rooms").select("*").eq("code", data.room_code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")

    room = room_result.data[0]
    if room["status"] != "active":
        raise HTTPException(status_code=400, detail="Room is closed")

    # Check if already joined
    existing = supabase.table("participants").select("id").eq("room_id", room["id"]).eq("user_id", data.user_id).execute()
    if not existing.data:
        participant = {
            "id": str(uuid.uuid4()),
            "room_id": room["id"],
            "user_id": data.user_id,
            "joined_at": datetime.utcnow().isoformat()
        }
        supabase.table("participants").insert(participant).execute()

    return {"message": "Joined room", "room": room}


@router.get("/export/{room_code}")
async def export_results(room_code: str):
    supabase = get_supabase()
    room_result = supabase.table("rooms").select("*").eq("code", room_code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")

    room = room_result.data[0]
    questions = supabase.table("questions").select("*").eq("room_id", room["id"]).execute().data

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Room", "Question", "Option", "Votes", "Percentage"])

    for q in questions:
        options = supabase.table("options").select("*").eq("question_id", q["id"]).execute().data
        for opt in options:
            vote_count = supabase.table("votes").select("id", count="exact").eq("option_id", opt["id"]).execute()
            opt["votes"] = vote_count.count or 0
        total = sum(o["votes"] for o in options)
        for opt in options:
            pct = round((opt["votes"] / total * 100) if total > 0 else 0, 1)
            writer.writerow([room["title"], q["text"], opt["text"], opt["votes"], f"{pct}%"])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={room_code}_results.csv"}
    )
