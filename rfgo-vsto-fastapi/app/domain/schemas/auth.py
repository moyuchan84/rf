from pydantic import BaseModel
from typing import List, Optional

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
