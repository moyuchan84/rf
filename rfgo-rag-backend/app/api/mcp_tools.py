from fastmcp import FastMCP
from typing import List, Dict
from app.domain.schemas.search import SearchRequest
from app.application.services.search_service import SearchService
from app.infrastructure.database import SessionLocal
from app.domain.models.models import PhotoKeyEmbedding

mcp = FastMCP("RFGo-RAG-Server")

@mcp.tool()
async def search_photo_key(query: str, k: int = 5) -> List[Dict]:
    """
    Search pgvector for relevant PhotoKey information based on a natural language query.
    """
    request = SearchRequest(query=query, k=k)
    results = await SearchService.perform_search(request)
    return results

@mcp.tool()
async def get_photo_key_context(photo_key_id: int) -> str:
    """
    Retrieve the full chunked context for a specific PhotoKey ID.
    """
    with SessionLocal() as session:
        result = session.query(PhotoKeyEmbedding).filter_by(photo_key_id=photo_key_id).first()
        return result.content if result else "Not found"
