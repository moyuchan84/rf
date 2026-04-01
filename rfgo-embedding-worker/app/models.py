from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from .config import settings

class Base(DeclarativeBase):
    pass

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    # ... other fields are omitted since we only need these for embedding

class PhotoKeyEmbedding(Base):
    __tablename__ = "photo_key_embeddings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    photo_key_id = Column(Integer, ForeignKey("photo_keys.id", ondelete="CASCADE"), unique=True)
    
    # pgvector embedding
    embedding = Column(Vector(settings.EMBEDDING_DIMENSION))
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    photo_key = relationship("PhotoKey")
