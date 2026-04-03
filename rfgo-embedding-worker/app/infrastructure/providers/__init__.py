from .openai import UniversalOpenAICompatibleProvider
from ...core.config import settings

def get_embedding_provider():
    """
    Factory Pattern: Dynamically switch provider based on environment variables.
    """
    if settings.EMBEDDING_TYPE == "ollama":
        print(f"Initializing Ollama Provider with model: {settings.EMBEDDING_MODEL}")
        return UniversalOpenAICompatibleProvider(
            api_key="ollama", # placeholder
            base_url=settings.OPENAI_BASE_URL or "http://localhost:11434/v1",
            model=settings.EMBEDDING_MODEL
        )
    
    elif settings.EMBEDDING_TYPE == "openai":
        print(f"Initializing OpenAI Provider with model: {settings.EMBEDDING_MODEL}")
        return UniversalOpenAICompatibleProvider(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model=settings.EMBEDDING_MODEL
        )
        
    # Example for internal corporate API (S-GPT etc)
    elif settings.EMBEDDING_TYPE == "internal":
        print(f"Initializing Internal Provider with model: {settings.EMBEDDING_MODEL}")
        return UniversalOpenAICompatibleProvider(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model=settings.EMBEDDING_MODEL
        )

    return UniversalOpenAICompatibleProvider(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL,
        model=settings.EMBEDDING_MODEL
    )
