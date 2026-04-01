from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFGo RAG Backend"
    
    # DB Configuration
    DB_USER: str = "admin"
    DB_PASSWORD: str = "password123"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5433"
    DB_NAME: str = "photokey_db"
    
    # AI Configuration
    AI_MODE: str = "dev"
    OPENAI_API_KEY: str = "sk-placeholder"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    @property
    def sqlalchemy_database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
