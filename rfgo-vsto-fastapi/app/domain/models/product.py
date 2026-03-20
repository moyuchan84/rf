from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, ARRAY, JSON, Boolean, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.domain.models.base import Base

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)
    design_rule = Column(String, unique=True, index=True)
    
    beol_options = relationship("BeolOption", back_populates="process_plan", cascade="all, delete-orphan")
    photo_keys = relationship("PhotoKey", back_populates="process_plan", cascade="all, delete-orphan")
    key_designs = relationship("KeyDesign", secondary="key_design_to_process_plan", back_populates="process_plans")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    
    process_plan = relationship("ProcessPlan", back_populates="beol_options")
    products = relationship("Product", back_populates="beol_option", cascade="all, delete-orphan")
    photo_keys = relationship("PhotoKey", back_populates="beol_option", cascade="all, delete-orphan")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

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

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ProductMeta(Base):
    __tablename__ = "product_meta"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True)
    
    process_id = Column(String, nullable=True)
    mto_date = Column(DateTime, nullable=True)
    customer = Column(String, nullable=True)
    application = Column(String, nullable=True)
    chip_size_x = Column(Float, nullable=True)
    chip_size_y = Column(Float, nullable=True)
    sl_size_x = Column(Float, nullable=True)
    sl_size_y = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    product = relationship("Product", back_populates="meta_info")

class RequestItem(Base):
    __tablename__ = "request_items"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    
    request_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    edm_list = Column(ARRAY(String), default=[])
    pkd_versions = Column(ARRAY(String), default=[])
    requester_id = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    product = relationship("Product", back_populates="requests")
    assignees = relationship("RequestAssignee", back_populates="request", cascade="all, delete-orphan")
    steps = relationship("RequestStep", back_populates="request", cascade="all, delete-orphan")
    stream_info = relationship("StreamInfo", back_populates="request", cascade="all, delete-orphan")
    table_maps = relationship("RequestTableMap", back_populates="request", cascade="all, delete-orphan")

class RequestAssignee(Base):
    __tablename__ = "request_assignees"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    category = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    
    request = relationship("RequestItem", back_populates="assignees")

class RequestStep(Base):
    __tablename__ = "request_steps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    step_order = Column(Integer, nullable=False)
    step_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    work_content = Column(Text, nullable=True)
    worker_id = Column(String, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    request = relationship("RequestItem", back_populates="steps")

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    beol_option_id = Column(Integer, ForeignKey("beol_options.id", ondelete="CASCADE"))
    
    rfg_category = Column(String)
    photo_category = Column(String)
    is_reference = Column(Boolean, default=False)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    raw_binary = Column(LargeBinary, nullable=True)
    filename = Column(String)
    updater = Column(String)
    log = Column(Text, nullable=True)
    update_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    product = relationship("Product", back_populates="photo_keys")
    process_plan = relationship("ProcessPlan", back_populates="photo_keys")
    beol_option = relationship("BeolOption", back_populates="photo_keys")
    table_maps = relationship("RequestTableMap", back_populates="photo_key", cascade="all, delete-orphan")

class KeyDesign(Base):
    __tablename__ = "key_designs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    key_type = Column(String, nullable=False)
    size_x = Column(Float, nullable=False)
    size_y = Column(Float, nullable=False)
    is_vertical = Column(Boolean, nullable=False)
    is_horizontal = Column(Boolean, nullable=False)
    rotation = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    gds_path = Column(String, nullable=True)
    edm_list = Column(ARRAY(String), default=[])
    x_axis = Column(JSON, nullable=False)
    y_axis = Column(JSON, nullable=False)
    images = Column(ARRAY(String), default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    process_plans = relationship("ProcessPlan", secondary="key_design_to_process_plan", back_populates="key_designs")

class ReticleLayout(Base):
    __tablename__ = "reticle_layouts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    product_id = Column(Integer, nullable=False)
    beol_option_id = Column(Integer, nullable=True)
    process_plan_id = Column(Integer, nullable=True)
    shot_info = Column(JSON, nullable=True)
    image_url = Column(String, nullable=True)
    boundary = Column(JSON, nullable=True)
    chips = Column(JSON, nullable=True)
    scribelanes = Column(JSON, nullable=True)
    placements = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class StreamInfo(Base):
    __tablename__ = "stream_info"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    product_id = Column(Integer, nullable=False)
    process_plan_id = Column(Integer, nullable=False)
    beol_option_id = Column(Integer, nullable=False)
    stream_path = Column(String, nullable=False)
    stream_input = Column(ARRAY(String), default=[])
    stream_output = Column(ARRAY(String), default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    request = relationship("RequestItem", back_populates="stream_info")

class RequestTableMap(Base):
    __tablename__ = "request_table_maps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    product_id = Column(Integer, nullable=True)
    process_plan_id = Column(Integer, nullable=True)
    beol_option_id = Column(Integer, nullable=True)
    photo_key_id = Column(Integer, ForeignKey("photo_keys.id", ondelete="CASCADE"))
    type = Column(String, nullable=False) # REFERENCE, SETUP
    
    request = relationship("RequestItem", back_populates="table_maps")
    photo_key = relationship("PhotoKey", back_populates="table_maps")

# Association Table for Many-to-Many
from sqlalchemy import Table
key_design_to_process_plan = Table(
    "key_design_to_process_plan",
    Base.metadata,
    Column("A", Integer, ForeignKey("key_designs.id", ondelete="CASCADE"), primary_key=True),
    Column("B", Integer, ForeignKey("process_plans.id", ondelete="CASCADE"), primary_key=True),
    extend_existing=True
)
