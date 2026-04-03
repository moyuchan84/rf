from typing import List
from openai import AsyncOpenAI
from .base import EmbeddingProvider
from ...core.config import settings

class UniversalOpenAICompatibleProvider(EmbeddingProvider):
    """
    Adapter Pattern: This provider works with OpenAI, Ollama, 
    and any internal GPT service that follows the OpenAI API standard.
    """
    def __init__(self, api_key: str, base_url: str, model: str):
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    async def get_embedding(self, text: str) -> List[float]:
        response = await self.client.embeddings.create(
            input=text,
            model=self.model
        )
        return response.data[0].embedding

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        response = await self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        return [data.embedding for data in response.data]
