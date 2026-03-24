from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import products, photo_keys, requests, auth
from app.infrastructure.database import init_db
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# RESTful Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(photo_keys.router, prefix="/api/v1/photo-keys", tags=["photo-keys"])
app.include_router(requests.router, prefix="/api/v1/requests", tags=["requests"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RFGo PhotoKey API"}
