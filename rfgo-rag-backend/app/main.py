from fastmcp import FastMCP
from typing import List, Dict
from .vector_store import vector_store

mcp = FastMCP("RFGo-RAG-Server")

@mcp.tool()
async def search_photo_key(query: str, k: int = 5) -> List[Dict]:
    """
    Search pgvector for relevant PhotoKey information based on a natural language query.
    Returns the most relevant chunks with their metadata.
    """
    print(f"RAG Search Query: {query}")
    results = await vector_store.similarity_search(query, k=k)
    return results

@mcp.tool()
async def get_photo_key_context(photo_key_id: int) -> str:
    """
    Retrieve the full chunked context for a specific PhotoKey ID.
    Useful for detailed analysis after finding relevant keys.
    """
    from sqlalchemy.orm import Session
    from .models import PhotoKeyEmbedding
    
    with vector_store.SessionLocal() as session:
        result = session.query(PhotoKeyEmbedding).filter_by(photo_key_id=photo_key_id).first()
        return result.content if result else "Not found"

if __name__ == "__main__":
    mcp.run()
