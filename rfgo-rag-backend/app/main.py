from fastmcp import FastMCP
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .vector_store import vector_store

mcp = FastMCP("RFGo-RAG-Server")
# We will run this alongside standard FastAPI
app = FastAPI(title="RFGo RAG API")

class SearchRequest(BaseModel):
    query: str
    k: int = 5

@app.post("/search")
async def api_search_photo_key(request: SearchRequest):
    """REST endpoint for the web frontend."""
    try:
        results = await vector_store.similarity_search(request.query, k=request.k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@mcp.tool()
async def search_photo_key(query: str, k: int = 5) -> List[Dict]:
...
    results = await vector_store.similarity_search(query, k=k)
    return results

if __name__ == "__main__":
    import uvicorn
    # When running normally, we use uvicorn to host the FastAPI app 
    # which can also expose the MCP protocol if needed.
    uvicorn.run(app, host="0.0.0.0", port=8001)
