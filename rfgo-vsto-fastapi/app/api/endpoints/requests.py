from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services import ProductService
from app.domain import schemas
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.product.RequestItem])
def list_requests(product_id: Optional[int] = None, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.list_request_items(product_id)

@router.post("/", response_model=schemas.product.RequestItem)
def create_request(data: schemas.product.RequestItemCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.create_request_item(data)

@router.put("/{id}", response_model=schemas.product.RequestItem)
def update_request(id: int, data: schemas.product.RequestItemUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.update_request_item(id, data)

@router.delete("/{id}")
def delete_request(id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete_request_item(id)
    return {"success": True}
