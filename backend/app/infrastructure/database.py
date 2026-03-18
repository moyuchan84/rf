from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.domain.models import Base

engine = create_engine(settings.sqlalchemy_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # 이제 테이블 생성은 Alembic 마이그레이션을 통해 관리하는 것을 권장합니다.
    # Base.metadata.create_all(bind=engine)
    pass
