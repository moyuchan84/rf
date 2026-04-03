from fastapi import APIRouter, HTTPException
from app.domain.schemas.search import ChatRequest
from app.application.services.chat_service import chat_service

router = APIRouter()

@router.post("/")
async def api_chat(request: ChatRequest):
    """Conversational Agent endpoint."""
    try:
        # Convert Pydantic models to dicts for the service
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        result = await chat_service.chat(messages_dict)
        return result
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
