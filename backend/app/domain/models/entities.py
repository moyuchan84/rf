from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.domain.models.base import Base

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)
    design_rule = Column(String, unique=True, index=True)
    beol_options = relationship("BeolOption", back_populates="process_plan")

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id"))
    process_plan = relationship("ProcessPlan", back_populates="beol_options")
    products = relationship("Product", back_populates="beol_option")

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
    rfg_category = Column(String)
    photo_category = Column(String)
    is_reference = Column(Boolean, default=False)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    filename = Column(String)
    updater = Column(String)
    update_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    product = relationship("Product", back_populates="photo_keys")
