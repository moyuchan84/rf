from pydantic import BaseModel
from typing import List, Optional

class ProductSchema(BaseModel):
    id: int
    partid: str
    product_name: str
    class Config:
        from_attributes = True

class BeolOptionSchema(BaseModel):
    id: int
    option_name: str
    products: List[ProductSchema]
    class Config:
        from_attributes = True

class ProcessPlanSchema(BaseModel):
    id: int
    design_rule: str
    beol_options: List[BeolOptionSchema]
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    partid: str
    product_name: str

class ProductCreate(ProductBase):
    beol_option_id: int

class Product(ProductBase):
    id: int
    beol_option_id: int

    class Config:
        from_attributes = True

class BeolOptionBase(BaseModel):
    option_name: str

class BeolOptionCreate(BeolOptionBase):
    process_plan_id: int

class ProcessPlanBase(BaseModel):
    design_rule: str

class ProcessPlanCreate(ProcessPlanBase):
    pass

class ProcessPlanUpdate(BaseModel):
    design_rule: Optional[str] = None

class BeolOptionUpdate(BaseModel):
    option_name: Optional[str] = None

class ProductUpdate(BaseModel):
    partid: Optional[str] = None
    product_name: Optional[str] = None
