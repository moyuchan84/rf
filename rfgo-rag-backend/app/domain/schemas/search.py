from pydantic import BaseModel
from typing import List, Optional

class ProductInfo(BaseModel):
    partid: Optional[str]
    name: Optional[str]
    design_rule: Optional[str]
    beol_option: Optional[str]

class SearchResult(BaseModel):
    content: str
    id: int
    table_name: Optional[str]
    rev_no: Optional[int]
    product_info: ProductInfo
    score: float

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class ChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
