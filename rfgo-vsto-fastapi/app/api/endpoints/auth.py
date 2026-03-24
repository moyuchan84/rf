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

class AuthRequest(BaseModel):
    ssoToken: str

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
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/authenticate", response_model=AuthTokenResponse)
async def authenticate(request: AuthRequest, db: Session = Depends(get_db)):
    # 1. SSO Token Validation (Mocked)
    # In reality, you'd call an internal SSO validation service here
    if not request.ssoToken:
        raise HTTPException(status_code=401, detail="Invalid SSO Token")
    
    # Mock profile extracted from SSO token
    # In a real scenario, this would come from the SSO provider
    mock_user_id = "M12345" # Example EP ID
    mock_profile = {
        "userId": mock_user_id,
        "epId": mock_user_id,
        "fullName": "홍길동",
        "deptName": "Photo기술팀",
        "deptId": "D001",
        "email": "gildong.hong@samsung.com"
    }

    # 2. Find or Create User (Auto-registration)
    user = db.query(User).filter(User.userId == mock_user_id).first()
    
    if not user:
        # Default role is USER
        default_role = db.query(Role).filter(Role.name == "USER").first()
        if not default_role:
            default_role = Role(name="USER", description="Default system user")
            db.add(default_role)
            db.commit()
            db.refresh(default_role)
        
        user = User(
            epId=mock_profile["epId"],
            userId=mock_profile["userId"],
            fullName=mock_profile["fullName"],
            deptName=mock_profile["deptName"],
            email=mock_profile["email"],
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
        DeptId=mock_profile["deptId"],
        UserId=user.userId,
        UserName=user.fullName,
        DeptName=user.deptName,
        JwtToken=jwt_token,
        Roles=[user.role.name]
    )
