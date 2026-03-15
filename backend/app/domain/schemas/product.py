from pydantic import BaseModel
from typing import List, Optional

class ProcessPlanBase(BaseModel):
    design_rule: str

class BeolOptionBase(BaseModel):
    option_name: str

class ProductBase(BaseModel):
    partid: str
    product_name: str

class Product(ProductBase):
    id: int
    beol_option_id: int

    class Config:
        from_attributes = True
