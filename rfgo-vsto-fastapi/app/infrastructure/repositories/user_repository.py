from sqlalchemy.orm import Session
from typing import Optional, List
from app.domain.models.user import User, Role

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.userId == user_id).first()

    def get_role_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == name).first()

    def create_role(self, name: str, description: Optional[str] = None) -> Role:
        role = Role(name=name, description=description)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def create_user(self, ep_id: str, user_id: str, full_name: str, dept_name: str, email: str, role_id: int) -> User:
        user = User(
            epId=ep_id,
            userId=user_id,
            fullName=full_name,
            deptName=dept_name,
            email=email,
            roleId=role_id
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
