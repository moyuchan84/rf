from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services import PhotoKeyService
from app.domain import schemas
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.PhotoKey)
def create_photo_key(data: schemas.PhotoKeyCreate, db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    return service.upload_photo_key(data)

@router.get("/{key_id}", response_model=schemas.PhotoKey)
def get_photo_key(key_id: int, db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    key = service.get_photo_key(key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Photo Key not found")
    return key

@router.get("/product/{product_id}", response_model=List[schemas.PhotoKey])
def list_keys_by_product(product_id: int, db: Session = Depends(get_db)):
    service = PhotoKeyService(db)
    return service.get_keys_by_product(product_id)
