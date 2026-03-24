from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services.auth_service import AuthService
from app.domain.schemas.auth import AuthRequest, AuthTokenResponse

router = APIRouter()

@router.post("/authenticate", response_model=AuthTokenResponse)
async def authenticate(request: AuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate user via SSO and return JWT token.
    Supports auto-registration on first login.
    """
    auth_service = AuthService(db)
    return auth_service.authenticate_sso(request)
