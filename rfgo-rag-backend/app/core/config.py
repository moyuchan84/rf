import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv

# Determine which env file to load
env_mode = os.getenv("AI_ENV", "dev")
env_file = f".env.{env_mode}"

# Explicitly load the determined env file
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    # Fallback to standard .env if specific one doesn't exist
    load_dotenv(".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFGo RAG Backend"
    
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
    AI_PROVIDER: str = "ollama"
    OPENAI_API_KEY: str = "sk-placeholder"
    OPENAI_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    
    LLM_MODEL: str = "llama3" # or your internal model
    EMBEDDING_MODEL: str = "bge-m3"
    EMBEDDING_DIMENSION: int = 1024

    @property
    def sqlalchemy_database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=".env", # This is still kept as a base
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()
