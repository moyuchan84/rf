from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services import PhotoKeyService
from app.domain import schemas
from typing import List

router = APIRouter()

@router.post("/upload", response_model=schemas.PhotoKey)
def upload_data(data: schemas.PhotoKeyCreate, db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    return service.upload_photo_keys(data)

@router.get("/products", response_model=List[schemas.ProductInfo])
def get_products(db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    return service.list_products()

@router.get("/restore/{key_id}")
def get_restore_data(key_id: int, db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    data = service.get_workbook_for_restore(key_id)
    if not data:
        raise HTTPException(status_code=404, detail="PhotoKey not found")
    return data
