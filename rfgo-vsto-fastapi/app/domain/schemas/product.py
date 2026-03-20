from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ProductMetaBase(BaseModel):
    process_id: Optional[str] = None
    mto_date: Optional[datetime] = None
    customer: Optional[str] = None
    application: Optional[str] = None
    chip_size_x: Optional[float] = None
    chip_size_y: Optional[float] = None
    sl_size_x: Optional[float] = None
    sl_size_y: Optional[float] = None

class ProductMetaCreate(ProductMetaBase):
    pass

class ProductMeta(ProductMetaBase):
    id: int
    product_id: int
    model_config = ConfigDict(from_attributes=True)

class RequestItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    edm_list: List[str] = []
    pkd_versions: List[str] = []
    requester_id: str

class RequestItemCreate(RequestItemBase):
    product_id: int

class RequestItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    edm_list: Optional[List[str]] = None
    pkd_versions: Optional[List[str]] = None
    requester_id: Optional[str] = None

class RequestItem(RequestItemBase):
    id: int
    product_id: int
    created_at: datetime
    update_time: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    partid: str
    product_name: str

class ProductCreate(ProductBase):
    beol_option_id: int
    meta_info: Optional[ProductMetaCreate] = None

class Product(ProductBase):
    id: int
    beol_option_id: int
    meta_info: Optional[ProductMeta] = None
    model_config = ConfigDict(from_attributes=True)

class BeolOptionSchema(BaseModel):
    id: int
    option_name: str
    products: List[Product]
    model_config = ConfigDict(from_attributes=True)

class ProcessPlanSchema(BaseModel):
    id: int
    design_rule: str
    beol_options: List[BeolOptionSchema]
    model_config = ConfigDict(from_attributes=True)

class ProductUpdate(BaseModel):
    partid: Optional[str] = None
    product_name: Optional[str] = None
    meta_info: Optional[ProductMetaCreate] = None

class BeolOptionBase(BaseModel):
    option_name: str

class BeolOptionCreate(BeolOptionBase):
    process_plan_id: int

class BeolOptionUpdate(BaseModel):
    option_name: Optional[str] = None

class ProcessPlanBase(BaseModel):
    design_rule: str

class ProcessPlanCreate(ProcessPlanBase):
    pass

class ProcessPlanUpdate(BaseModel):
    design_rule: Optional[str] = None
