from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import search, chat
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Simple logic to choose environment file
    # Run with: AI_ENV=prod uv run python -m app.main
    env = os.getenv("AI_ENV", "dev")
    print(f"Starting {settings.PROJECT_NAME} in {env} mode...")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
