from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.core.config import settings

class Base(DeclarativeBase):
    pass

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)
    design_rule = Column(String, unique=True, index=True)
    photo_keys = relationship("PhotoKey", back_populates="process_plan")

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id"))
    products = relationship("Product", back_populates="beol_option")
    photo_keys = relationship("PhotoKey", back_populates="beol_option")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    partid = Column(String, unique=True, index=True)
    product_name = Column(String, index=True)
    beol_option_id = Column(Integer, ForeignKey("beol_options.id"))
    
    beol_option = relationship("BeolOption", back_populates="products")
    photo_keys = relationship("PhotoKey", back_populates="product")

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    process_plan_id = Column(Integer, ForeignKey("process_plans.id"))
    beol_option_id = Column(Integer, ForeignKey("beol_options.id"))
    
    table_name = Column(String)
    rev_no = Column(Integer)
    filename = Column(String)
    
    # Relationships
    embedding = relationship("PhotoKeyEmbedding", back_populates="photo_key", uselist=False)
    product = relationship("Product", back_populates="photo_keys")
    process_plan = relationship("ProcessPlan", back_populates="photo_keys")
    beol_option = relationship("BeolOption", back_populates="photo_keys")

class PhotoKeyEmbedding(Base):
    __tablename__ = "photo_key_embeddings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    photo_key_id = Column(Integer, ForeignKey("photo_keys.id", ondelete="CASCADE"), unique=True)
    
    embedding = Column(Vector(settings.EMBEDDING_DIMENSION))
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    photo_key = relationship("PhotoKey", back_populates="embedding")
