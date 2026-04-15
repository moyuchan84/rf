import json
import redis
from sqlalchemy.orm import Session
from app.domain import schemas, models
from app.infrastructure.repositories import PhotoKeyRepository, ProductRepository
from app.core.config import settings

class PhotoKeyService:
    def __init__(self, db: Session):
        self.photo_key_repo = PhotoKeyRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db
        self.redis_client = redis.from_url(settings.REDIS_URL)

    def _publish_event(self, photo_key_id: int):
        """Publish photo_key.created event to Redis."""
        try:
            event_data = {"id": photo_key_id}
            self.redis_client.publish("photo_key.created", json.dumps(event_data))
        except Exception as e:
            # We don't want to fail the main request if Redis publishing fails
            print(f"Failed to publish event to Redis: {e}")

    def upload_photo_key(self, data: schemas.PhotoKeyCreate):
        # Ensure hierarchy exists
        pp = self.product_repo.get_or_create_process_plan(data.process_plan)
        bo = self.product_repo.get_or_create_beol_option(data.beol_option, pp.id)
        prod = self.product_repo.get_or_create_product(data.partid, data.product_name, bo.id)
        
        # Link to BeolGroup for sharing PhotoKey
        bg_id = bo.beol_group_id
        
        # Create PhotoKey with linked hierarchy
        photo_key = self.photo_key_repo.create_photo_key(prod.id, pp.id, bg_id, data)
        
        # Publish event
        if photo_key:
            self._publish_event(photo_key.id)
            
        return photo_key

    def upload_photo_keys(self, data: schemas.PhotoKeyBatchCreate):
        """Batch upload multiple photo keys with a shared hierarchy."""
        # 1. Resolve shared hierarchy once
        h = data.hierarchy
        pp = self.product_repo.get_or_create_process_plan(h.processPlan)
        bo = self.product_repo.get_or_create_beol_option(h.beolOption, pp.id)
        prod = self.product_repo.get_or_create_product(h.partId, h.productName, bo.id)
        
        bg_id = bo.beol_group_id
        
        results = []
        for wb in data.workbooks:
            # Create PhotoKey with linked hierarchy IDs resolved above
            photo_key = self.photo_key_repo.create_photo_key(prod.id, pp.id, bg_id, wb)
            
            if photo_key:
                self._publish_event(photo_key.id)
                results.append(photo_key)
                
        return results

    def list_products(self):
        """List products that have photo keys."""
        return self.db.query(models.Product).join(models.Product.photo_keys).distinct().all()

    def get_photo_key(self, key_id: int):
        return self.photo_key_repo.get_photo_key_by_id(key_id)

    def get_workbook_for_restore(self, key_id: int):
        """Get workbook data for Excel restoration."""
        key = self.photo_key_repo.get_photo_key_by_id(key_id)
        return key.workbook_data if key else None

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
        return self.photo_key_repo.check_photo_key_exists(prod.id, table_name, rev_no)

    def update_photo_key(self, key_id: int, data: schemas.PhotoKeyUpdate):
        return self.photo_key_repo.update_photo_key(key_id, data)

    def delete_photo_key(self, key_id: int):
        return self.photo_key_repo.delete_photo_key(key_id)
