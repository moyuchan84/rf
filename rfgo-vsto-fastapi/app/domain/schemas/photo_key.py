from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class PhotoKeyBase(BaseModel):
    rfg_category: Optional[str] = None
    photo_category: Optional[str] = None
    is_reference: Optional[bool] = False
    table_name: Optional[str] = None
    rev_no: Optional[int] = None
    workbook_data: Optional[Dict[str, Any]] = None
    binary_content: Optional[str] = None
    filename: Optional[str] = None
    updater: Optional[str] = None
    log: Optional[str] = None

class PhotoKeyCreate(PhotoKeyBase):
    process_plan: Optional[str] = None
    beol_option: Optional[str] = None
    partid: Optional[str] = None
    product_name: Optional[str] = None

class PhotoKeyUpdate(BaseModel):
    rfg_category: Optional[str] = None
    photo_category: Optional[str] = None
    is_reference: Optional[bool] = None
    table_name: Optional[str] = None
    rev_no: Optional[int] = None
    log: Optional[str] = None

class HierarchyBase(BaseModel):
    processPlan: str
    beolGroup: Optional[str] = None
    beolOption: str
    partId: str
    productName: str

class PhotoKeyBatchCreate(BaseModel):
    hierarchy: HierarchyBase
    workbooks: List[PhotoKeyCreate]

class PhotoKey(PhotoKeyBase):
    id: int
    product_id: Optional[int] = None
    process_plan_id: Optional[int] = None
    beol_group_id: Optional[int] = None
    update_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class ProductWithKeys(BaseModel):
    partid: str
    product_name: str
    photo_keys: List[PhotoKey]
    
    model_config = ConfigDict(from_attributes=True)
