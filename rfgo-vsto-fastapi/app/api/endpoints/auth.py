from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
from app.infrastructure.database import get_db
from app.domain.models.user import User, Role
from app.core.config import settings

router = APIRouter()

class UserProfileInput(BaseModel):
    epId: str
    userId: str
    fullName: str
    deptName: str
    email: str

class AuthRequest(BaseModel):
    ssoToken: str
    profile: Optional[UserProfileInput] = None

class AuthTokenResponse(BaseModel):
    LoginId: str
    DeptId: str
    UserId: str
    UserName: str
    DeptName: str
    JwtToken: str
    Roles: List[str]

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/authenticate", response_model=AuthTokenResponse)
async def authenticate(request: AuthRequest, db: Session = Depends(get_db)):
    # 1. SSO Validation
    if not request.ssoToken:
        raise HTTPException(status_code=401, detail="Invalid SSO Token")
    
    # In local/dev mode, we might trust the profile passed from VSTO
    # In production, we would validate the ssoToken with the internal SSO server
    profile = request.profile
    if not profile:
        # Fallback for mock if profile not provided (legacy support or internal mock)
        if "MOCK" in request.ssoToken:
            profile = UserProfileInput(
                epId="11112222",
                userId="admin_user",
                fullName="Admin Manager",
                deptName="Digital Transformation Team",
                email="admin@samsung.com"
            )
        else:
            raise HTTPException(status_code=400, detail="Profile information required")

    # 2. Find or Create User (Auto-registration)
    user = db.query(User).filter(User.userId == profile.userId).first()
    
    if not user:
        # Default role is USER if not exists
        default_role = db.query(Role).filter(Role.name == "USER").first()
        if not default_role:
            default_role = Role(name="USER", description="Default system user")
            db.add(default_role)
            db.commit()
            db.refresh(default_role)
        
        user = User(
            epId=profile.epId,
            userId=profile.userId,
            fullName=profile.fullName,
            deptName=profile.deptName,
            email=profile.email,
            roleId=default_role.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 3. Generate JWT
    token_data = {
        "sub": str(user.id),
        "userId": user.userId,
        "role": user.role.name
    }
    jwt_token = create_access_token(
        data=token_data, 
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # 4. Return PascalCase response for C# compatibility
    return AuthTokenResponse(
        LoginId=user.userId,
        DeptId="D001", # Mock DeptId
        UserId=user.userId,
        UserName=user.fullName,
        DeptName=user.deptName,
        JwtToken=jwt_token,
        Roles=[user.role.name]
    )
