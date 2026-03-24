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
    # Prisma @map("epid") -> epid
    epId = Column("epid", String, unique=True, nullable=False)
    # Prisma @map("user_id") -> user_id
    userId = Column("user_id", String, unique=True, nullable=False)
    # Prisma @map("full_name") -> full_name
    fullName = Column("full_name", String, nullable=False)
    # Prisma @map("dept_name") -> dept_name
    deptName = Column("dept_name", String, nullable=False)
    email = Column(String, nullable=False)
    # Prisma @map("role_id") -> role_id
    roleId = Column("role_id", Integer, ForeignKey("roles.id"), nullable=False)
    # Prisma @map("created_at") -> created_at
    createdAt = Column("created_at", DateTime(timezone=True), server_default=func.now())
    # Prisma @map("update_time") -> update_time
    updatedAt = Column("update_time", DateTime(timezone=True), onupdate=func.now())

    role = relationship("Role", back_populates="users")

    __table_args__ = (
        Index("ix_users_id", "id"),
    )
