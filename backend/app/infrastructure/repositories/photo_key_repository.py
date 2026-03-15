from sqlalchemy.orm import Session
from app.domain import models, schemas

class PhotoKeyRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_photo_key(self, product_id: int, obj_in: schemas.PhotoKeyCreate):
        db_obj = models.PhotoKey(
            product_id=product_id,
            rfg_category=obj_in.rfg_category,
            photo_category=obj_in.photo_category,
            is_reference=obj_in.is_reference,
            table_name=obj_in.table_name,
            rev_no=obj_in.rev_no,
            workbook_data=obj_in.workbook_data,
            filename=obj_in.filename,
            updater=obj_in.updater
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_photo_key_by_id(self, key_id: int):
        return self.db.query(models.PhotoKey).filter(models.PhotoKey.id == key_id).first()

    def list_keys_by_product(self, product_id: int):
        return self.db.query(models.PhotoKey).filter(models.PhotoKey.product_id == product_id).all()
