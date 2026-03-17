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
        
        # Create PhotoKey with linked hierarchy
        return self.photo_key_repo.create_photo_key(prod.id, pp.id, bo.id, data)

    def get_photo_key(self, key_id: int):
        return self.photo_key_repo.get_photo_key_by_id(key_id)

    def get_keys_by_product(self, product_id: int):
        return self.photo_key_repo.list_keys_by_product(product_id)

    def get_next_revision(self, process_plan: str, beol_option: str, partid: str, table_name: str) -> int:
        prod = self.product_repo.get_product_by_partid(partid)
        if not prod:
            return 1
        max_rev = self.photo_key_repo.get_max_revision(prod.id, table_name)
        return max_rev + 1

    def check_exists(self, partid: str, table_name: str, rev_no: int) -> bool:
        prod = self.product_repo.get_product_by_partid(partid)
        if not prod:
            return False
        existing = self.db.query(models.PhotoKey).filter(
            models.PhotoKey.product_id == prod.id,
            models.PhotoKey.table_name == table_name,
            models.PhotoKey.rev_no == rev_no
        ).first()
        return existing is not None
