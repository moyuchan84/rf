import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv

env_mode = os.getenv("AI_ENV", "dev")
env_file = f".env.{env_mode}"

if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    load_dotenv(".env")

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
    
    # AI Configuration
    AI_MODE: str = "dev"
    EMBEDDING_TYPE: str = "ollama"
    EMBEDDING_MODEL: str = "bge-m3"
    EMBEDDING_DIMENSION: int = 1024
    
    OPENAI_API_KEY: str = "ollama"
    OPENAI_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    OLLAMA_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    
    @property
    def sqlalchemy_database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()
