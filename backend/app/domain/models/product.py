from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, ARRAY, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.domain.models.base import Base

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)
    design_rule = Column(String, unique=True, index=True)
    beol_options = relationship("BeolOption", back_populates="process_plan", cascade="all, delete-orphan")

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    process_plan = relationship("ProcessPlan", back_populates="beol_options")
    products = relationship("Product", back_populates="beol_option", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    partid = Column(String, unique=True, index=True)
    product_name = Column(String, index=True)
    beol_option_id = Column(Integer, ForeignKey("beol_options.id", ondelete="CASCADE"))
    beol_option = relationship("BeolOption", back_populates="products")
    
    meta_info = relationship("ProductMeta", back_populates="product", uselist=False, cascade="all, delete-orphan")
    requests = relationship("RequestItem", back_populates="product", cascade="all, delete-orphan")
    photo_keys = relationship("PhotoKey", back_populates="product", cascade="all, delete-orphan")

class ProductMeta(Base):
    __tablename__ = "product_meta"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True)
    product = relationship("Product", back_populates="meta_info")
    
    process_id = Column(String, nullable=True)
    mto_date = Column(DateTime, nullable=True)
    customer = Column(String, nullable=True)
    application = Column(String, nullable=True)
    chip_size_x = Column(Float, nullable=True)
    chip_size_y = Column(Float, nullable=True)
    sl_size_x = Column(Float, nullable=True)
    sl_size_y = Column(Float, nullable=True)

class RequestItem(Base):
    __tablename__ = "request_items"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    product = relationship("Product", back_populates="requests")
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    edm_list = Column(ARRAY(String), default=[])
    pkd_versions = Column(ARRAY(String), default=[])
    requester_id = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    beol_option_id = Column(Integer, ForeignKey("beol_options.id", ondelete="CASCADE"))
    
    product = relationship("Product", back_populates="photo_keys")
    process_plan = relationship("ProcessPlan")
    beol_option = relationship("BeolOption")
    
    rfg_category = Column(String)  # common, option
    photo_category = Column(String) # info, key
    is_reference = Column(Boolean, default=False)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    filename = Column(String)
    updater = Column(String)
    log = Column(Text, nullable=True)
    update_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
