import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv

# .env 로드
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("DB_USER", "admin")
    password = os.getenv("DB_PASSWORD", "password123")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5433")
    db_name = os.getenv("DB_NAME", "photokey_db")
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models (기존 스키마와 동일하게 정의) ---

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    epid = Column(String, unique=True, index=True)
    user_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    dept_name = Column(String)
    email = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Seeding Logic ---

def seed_roles(db):
    print("--- Seeding Roles ---")
    roles = [
        {"name": "ADMIN", "description": "System Administrator"},
        {"name": "RFG", "description": "RFG Photo Key Manager"},
        {"name": "INNO", "description": "Innovation Rule Designer"},
        {"name": "USER", "description": "General System User"},
    ]
    
    for r_data in roles:
        role = db.query(Role).filter(Role.name == r_data["name"]).first()
        if not role:
            role = Role(**r_data)
            db.add(role)
            print(f"Created role: {r_data['name']}")
        else:
            print(f"Role already exists: {r_data['name']}")
    db.commit()

def seed_users(db):
    print("\n--- Seeding Users ---")
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    rfg_role = db.query(Role).filter(Role.name == "RFG").first()
    user_role = db.query(Role).filter(Role.name == "USER").first()

    mock_users = [
        {
            "epid": "11112222",
            "user_id": "admin_user",
            "full_name": "Admin Manager",
            "dept_name": "Digital Transformation Team",
            "email": "admin@samsung.com",
            "role_id": admin_role.id
        },
        {
            "epid": "22223333",
            "user_id": "rfg_manager",
            "full_name": "RFG Expert",
            "dept_name": "Photo Technology Group",
            "email": "rfg@samsung.com",
            "role_id": rfg_role.id
        },
        {
            "epid": "99990000",
            "user_id": "regular_dev",
            "full_name": "Junior Engineer",
            "dept_name": "Logic Design Team",
            "email": "junior@samsung.com",
            "role_id": user_role.id
        }
    ]

    for u_data in mock_users:
        user = db.query(User).filter(User.user_id == u_data["user_id"]).first()
        if not user:
            user = User(**u_data)
            db.add(user)
            print(f"Created user: {u_data['full_name']} ({u_data['user_id']})")
        else:
            # 롤 업데이트 테스트를 위해 기존 유저 정보 업데이트 가능
            print(f"User already exists: {u_data['user_id']}")
    db.commit()

def run_seed():
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_users(db)
        print("\nSeed completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
