from app.infrastructure.vector_store import vector_store
from app.domain.schemas.search import SearchRequest

class SearchService:
    @staticmethod
    async def perform_search(request: SearchRequest):
        """
        Coordinates the search process.
        In clean architecture, this is where business rules/logic would live.
        """
        results = await vector_store.similarity_search(request.query, k=request.k)
        return results
