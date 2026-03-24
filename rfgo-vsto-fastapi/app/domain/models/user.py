from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.domain.models.base import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # ADMIN, RFG, INNO, USER
    description = Column(String, nullable=True)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    epId = Column(String, unique=True, nullable=False)
    userId = Column(String, unique=True, nullable=False)
    fullName = Column(String, nullable=False)
    deptName = Column(String, nullable=False)
    email = Column(String, nullable=False)
    roleId = Column(Integer, ForeignKey("roles.id"), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    role = relationship("Role", back_populates="users")

    # Add index manually if needed or via alembic
    __table_args__ = (
        Index("ix_users_id", "id"),
    )
