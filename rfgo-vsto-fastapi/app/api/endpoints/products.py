from fastapi import APIRouter, Depends, HTTPException
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

# --- CRUD for ProcessPlan ---
@router.post("/process-plans", response_model=schemas.product.ProcessPlanSchema)
def create_process_plan(data: schemas.product.ProcessPlanCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.create_process_plan(data)

@router.put("/process-plans/{id}", response_model=schemas.product.ProcessPlanSchema)
def update_process_plan(id: int, data: schemas.product.ProcessPlanUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.update_process_plan(id, data)

@router.delete("/process-plans/{id}")
def delete_process_plan(id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete_process_plan(id)
    return {"success": True}

# --- CRUD for BEOLOption ---
@router.post("/beol-options", response_model=schemas.product.BeolOptionSchema)
def create_beol_option(data: schemas.product.BeolOptionCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.create_beol_option(data)

@router.put("/beol-options/{id}", response_model=schemas.product.BeolOptionSchema)
def update_beol_option(id: int, data: schemas.product.BeolOptionUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.update_beol_option(id, data)

@router.delete("/beol-options/{id}")
def delete_beol_option(id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete_beol_option(id)
    return {"success": True}

# --- CRUD for Product ---
@router.post("/products", response_model=schemas.product.Product)
def create_product(data: schemas.product.ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.create_product(data)

@router.put("/products/{id}", response_model=schemas.product.Product)
def update_product(id: int, data: schemas.product.ProductUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.update_product(id, data)

@router.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete_product(id)
    return {"success": True}
