from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:password123@localhost:5433/photokey_db"
    PROJECT_NAME: str = "RFGo PhotoKey Management API"

    class Config:
        env_file = ".env"

settings = Settings()
