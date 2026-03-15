from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services import ProductService
from app.domain import schemas
from typing import List

router = APIRouter()

@router.get("/", response_model=List[schemas.product.Product])
def list_products(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.list_all_products()

@router.get("/hierarchy", response_model=List[schemas.product.ProcessPlanSchema])
def get_hierarchy(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_product_hierarchy()
