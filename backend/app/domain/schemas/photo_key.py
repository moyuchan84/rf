from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class PhotoKeyBase(BaseModel):
    rfg_category: str
    photo_category: str
    is_reference: bool
    table_name: str
    rev_no: int
    workbook_data: Dict[str, Any]
    filename: str
    updater: str

class PhotoKeyCreate(PhotoKeyBase):
    process_plan: str
    beol_option: str
    partid: str
    product_name: str

class PhotoKey(PhotoKeyBase):
    id: int
    product_id: int
    process_plan_id: int
    beol_option_id: int
    update_date: datetime

    class Config:
        from_attributes = True

class ProductWithKeys(BaseModel):
    partid: str
    product_name: str
    photo_keys: List[PhotoKey]

    class Config:
        from_attributes = True
