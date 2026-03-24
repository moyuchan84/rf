from datetime import timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.security import create_access_token
from app.infrastructure.repositories.user_repository import UserRepository
from app.domain.schemas.auth import AuthRequest, AuthTokenResponse, UserProfileInput
from app.domain.models.user import User

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def authenticate_sso(self, request: AuthRequest) -> AuthTokenResponse:
        # 1. SSO Validation
        if not request.ssoToken:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid SSO Token")
        
        # In local/dev mode, we might trust the profile passed from VSTO
        profile = request.profile
        if not profile:
            # Fallback for mock if profile not provided
            if "MOCK" in request.ssoToken:
                profile = UserProfileInput(
                    epId="11112222",
                    userId="admin_user",
                    fullName="Admin Manager",
                    deptName="Digital Transformation Team",
                    email="admin@samsung.com"
                )
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile information required")

        # 2. Find or Create User (Auto-registration)
        user = self.user_repo.get_by_user_id(profile.userId)
        
        if not user:
            # Default role is USER if not exists
            role = self.user_repo.get_role_by_name("USER")
            if not role:
                role = self.user_repo.create_role(name="USER", description="Default system user")
            
            user = self.user_repo.create_user(
                ep_id=profile.epId,
                user_id=profile.userId,
                full_name=profile.fullName,
                dept_name=profile.deptName,
                email=profile.email,
                role_id=role.id
            )

        # 3. Generate JWT
        jwt_token = create_access_token(
            subject=user.id,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # 4. Return PascalCase response for C# compatibility
        return AuthTokenResponse(
            LoginId=user.userId,
            DeptId="D001", # Mock DeptId or pull from somewhere
            UserId=user.userId,
            UserName=user.fullName,
            DeptName=user.deptName,
            JwtToken=jwt_token,
            Roles=[user.role.name]
        )
