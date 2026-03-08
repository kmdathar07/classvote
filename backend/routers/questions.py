from fastapi import APIRouter, HTTPException
from services.database import get_supabase

router = APIRouter()


@router.get("/{question_id}/results")
async def get_question_results(question_id: str):
    supabase = get_supabase()
    options = supabase.table("options").select("*").eq("question_id", question_id).execute().data
    for opt in options:
        vote_count = supabase.table("votes").select("id", count="exact").eq("option_id", opt["id"]).execute()
        opt["votes"] = vote_count.count or 0
    total = sum(o["votes"] for o in options)
    for opt in options:
        opt["percentage"] = round((opt["votes"] / total * 100) if total > 0 else 0, 1)
    return {"options": options, "total": total}
