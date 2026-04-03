from fastapi import APIRouter, HTTPException
from app.domain.schemas.search import SearchRequest
from app.application.services.search_service import SearchService

router = APIRouter()

@router.post("/")
async def api_search_photo_key(request: SearchRequest):
    """REST endpoint for the web frontend."""
    try:
        results = await SearchService.perform_search(request)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
