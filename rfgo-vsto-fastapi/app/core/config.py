from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "RFGo PhotoKey Management API"
    
    # DB Configuration
    DB_USER: str = "admin"
    DB_PASSWORD: str = "password123"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5433"
    DB_NAME: str = "photokey_db"
    
    # Full URL override
    DATABASE_URL: Optional[str] = None

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
