from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.database import get_supabase
from datetime import datetime, timedelta
import uuid
import random
import string

router = APIRouter()


def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


class OptionCreate(BaseModel):
    text: str


class QuestionCreate(BaseModel):
    text: str
    options: List[OptionCreate]


class RoomCreate(BaseModel):
    title: str
    host_id: str
    questions: List[QuestionCreate]
    timer_minutes: Optional[int] = None
    anonymous: bool = False


@router.post("/")
async def create_room(room_data: RoomCreate):
    supabase = get_supabase()

    # Generate unique room code
    code = generate_room_code()
    while supabase.table("rooms").select("id").eq("code", code).execute().data:
        code = generate_room_code()

    expires_at = None
    if room_data.timer_minutes:
        expires_at = (datetime.utcnow() + timedelta(minutes=room_data.timer_minutes)).isoformat()

    room = {
        "id": str(uuid.uuid4()),
        "code": code,
        "title": room_data.title,
        "host_id": room_data.host_id,
        "anonymous": room_data.anonymous,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": expires_at
    }
    room_result = supabase.table("rooms").insert(room).execute()
    room_id = room_result.data[0]["id"]

    # Insert questions and options
    for q_data in room_data.questions:
        question = {
            "id": str(uuid.uuid4()),
            "room_id": room_id,
            "text": q_data.text,
            "created_at": datetime.utcnow().isoformat()
        }
        q_result = supabase.table("questions").insert(question).execute()
        q_id = q_result.data[0]["id"]

        for opt in q_data.options:
            option = {
                "id": str(uuid.uuid4()),
                "question_id": q_id,
                "text": opt.text
            }
            supabase.table("options").insert(option).execute()

    # Return full room data
    return await get_room_by_code(code)


@router.get("/{code}")
async def get_room_by_code(code: str):
    supabase = get_supabase()
    result = supabase.table("rooms").select("*").eq("code", code.upper()).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Room not found")

    room = result.data[0]

    # Get questions with options
    questions = supabase.table("questions").select("*").eq("room_id", room["id"]).execute().data
    for q in questions:
        q["options"] = supabase.table("options").select("*").eq("question_id", q["id"]).execute().data

    room["questions"] = questions
    return room


@router.get("/{code}/results")
async def get_room_results(code: str):
    supabase = get_supabase()
    room_result = supabase.table("rooms").select("*").eq("code", code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")

    room = room_result.data[0]
    questions = supabase.table("questions").select("*").eq("room_id", room["id"]).execute().data

    results = []
    for q in questions:
        options = supabase.table("options").select("*").eq("question_id", q["id"]).execute().data
        for opt in options:
            vote_count = supabase.table("votes").select("id", count="exact").eq("option_id", opt["id"]).execute()
            opt["votes"] = vote_count.count or 0
        total = sum(o["votes"] for o in options)
        for opt in options:
            opt["percentage"] = round((opt["votes"] / total * 100) if total > 0 else 0, 1)
        q["options"] = options
        q["total_votes"] = total
        results.append(q)

    # Participant count
    participant_count = supabase.table("participants").select("id", count="exact").eq("room_id", room["id"]).execute().count or 0

    return {
        "room": room,
        "questions": results,
        "participant_count": participant_count
    }


@router.post("/{code}/close")
async def close_room(code: str):
    supabase = get_supabase()
    result = supabase.table("rooms").update({"status": "closed"}).eq("code", code.upper()).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room closed", "room": result.data[0]}


@router.post("/{code}/kick/{user_id}")
async def kick_user(code: str, user_id: str):
    supabase = get_supabase()
    room_result = supabase.table("rooms").select("id").eq("code", code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")
    room_id = room_result.data[0]["id"]
    supabase.table("participants").delete().eq("room_id", room_id).eq("user_id", user_id).execute()
    return {"message": "User kicked"}


@router.get("/{code}/participants")
async def get_participants(code: str):
    supabase = get_supabase()
    room_result = supabase.table("rooms").select("id").eq("code", code.upper()).execute()
    if not room_result.data:
        raise HTTPException(status_code=404, detail="Room not found")
    room_id = room_result.data[0]["id"]
    participants = supabase.table("participants").select("*, users(name, email)").eq("room_id", room_id).execute()
    return participants.data
