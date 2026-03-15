from sqlalchemy.orm import Session
from app.domain import schemas
from app.infrastructure.repositories import PhotoKeyRepository, ProductRepository

class PhotoKeyService:
    def __init__(self, db: Session):
        self.photo_key_repo = PhotoKeyRepository(db)
        self.product_repo = ProductRepository(db)

    def upload_photo_key(self, data: schemas.PhotoKeyCreate):
        # Ensure hierarchy exists
        pp = self.product_repo.get_or_create_process_plan(data.process_plan)
        bo = self.product_repo.get_or_create_beol_option(data.beol_option, pp.id)
        prod = self.product_repo.get_or_create_product(data.partid, data.product_name, bo.id)
        
        # Create PhotoKey
        return self.photo_key_repo.create_photo_key(prod.id, data)

    def get_photo_key(self, key_id: int):
        return self.photo_key_repo.get_photo_key_by_id(key_id)

    def get_keys_by_product(self, product_id: int):
        return self.photo_key_repo.list_keys_by_product(product_id)
