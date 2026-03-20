from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.services import PhotoKeyService
from app.domain import schemas
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.PhotoKey)
def create_photo_key(data: schemas.PhotoKeyCreate, db: Session = Depends(get_db)):
    """Create a new photo key entry (used by VSTO)."""
    service = PhotoKeyService(db)
    return service.upload_photo_key(data)

@router.post("/upload-batch", response_model=List[schemas.PhotoKey])
def upload_data_batch(data: schemas.PhotoKeyBatchCreate, db: Session = Depends(get_db)):
    """Upload multiple photo keys."""
    service = PhotoKeyService(db)
    return service.upload_photo_keys(data)

@router.get("/products", response_model=List[schemas.ProductWithKeys])
def get_products_with_keys(db: Session = Depends(get_db)):
    """List products that have photo keys."""
    service = PhotoKeyService(db)
    return service.list_products()

@router.get("/{key_id}", response_model=schemas.PhotoKey)
def get_photo_key(key_id: int, db: Session = Depends(get_db)):
    """Get a single photo key entry."""
    service = PhotoKeyService(db)
    key = service.get_photo_key(key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Photo Key not found")
    return key

@router.get("/product/{product_id}", response_model=List[schemas.PhotoKey])
def list_keys_by_product(product_id: int, db: Session = Depends(get_db)):
    """List all photo keys for a specific product."""
    service = PhotoKeyService(db)
    return service.get_keys_by_product(product_id)

@router.get("/next-rev/{partid}/{table_name}")
def get_next_rev(partid: str, table_name: str, db: Session = Depends(get_db)):
    """Get the next revision number for a product and table."""
    service = PhotoKeyService(db)
    return {"next_rev": service.get_next_revision("", "", partid, table_name)}

@router.get("/exists/{partid}/{table_name}/{rev_no}")
def check_existence(partid: str, table_name: str, rev_no: int, db: Session = Depends(get_db)):
    """Check if a specific revision of a table already exists."""
    service = PhotoKeyService(db)
    return {"exists": service.check_exists(partid, table_name, rev_no)}

@router.get("/restore/{key_id}")
def get_restore_data(key_id: int, db: Session = Depends(get_db)):
    """Get workbook data for Excel restoration."""
    service = PhotoKeyService(db)
    data = service.get_workbook_for_restore(key_id)
    if not data:
        raise HTTPException(status_code=404, detail="PhotoKey not found")
    return data
