from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.database import get_supabase
from datetime import datetime
import uuid

router = APIRouter()


class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


@router.post("/login", response_model=UserResponse)
async def login_or_create_user(user: UserCreate):
    supabase = get_supabase()
    # Check if user exists
    result = supabase.table("users").select("*").eq("email", user.email).execute()
    if result.data:
        existing = result.data[0]
        # Update name if changed
        if existing["name"] != user.name:
            updated = supabase.table("users").update({"name": user.name}).eq("id", existing["id"]).execute()
            return updated.data[0]
        return existing
    # Create new user
    new_user = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("users").insert(new_user).execute()
    return result.data[0]


@router.get("/{user_id}/rooms")
async def get_user_rooms(user_id: str):
    supabase = get_supabase()
    result = supabase.table("rooms").select(
        "*, questions(*, options(*))"
    ).eq("host_id", user_id).order("created_at", desc=True).execute()
    return result.data
