from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFGo Embedding Worker"
    
    # DB Configuration
    DB_USER: str = "admin"
    DB_PASSWORD: str = "password123"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5433"
    DB_NAME: str = "photokey_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # AI Configuration (Switchable)
    AI_MODE: str = "dev" # dev, prod
    EMBEDDING_TYPE: str = "ollama" # ollama, openai, internal
    EMBEDDING_MODEL: str = "nomic-embed-text"
    EMBEDDING_DIMENSION: int = 768
    
    # OpenAI/Ollama Common
    OPENAI_API_KEY: str = "ollama" # dummy for ollama
    OPENAI_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    OLLAMA_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    
    @property
    def sqlalchemy_database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" # 이 설정을 추가하여 .env에 더 많은 변수가 있어도 에러가 나지 않게 합니다.

settings = Settings()
