from sqlalchemy.orm import Session
from app.infrastructure.repositories import ProductRepository
from app.domain import schemas
from typing import Optional

class ProductService:
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)

    def list_all_products(self):
        return self.repository.list_all_products()

    def get_product_hierarchy(self):
        return self.repository.get_hierarchy()

    # --- CRUD Methods for ProcessPlan ---
    def create_process_plan(self, data: schemas.product.ProcessPlanCreate):
        return self.repository.create_process_plan(data.design_rule)

    def update_process_plan(self, id: int, data: schemas.product.ProcessPlanUpdate):
        return self.repository.update_process_plan(id, data.design_rule)

    def delete_process_plan(self, id: int):
        return self.repository.delete_process_plan(id)

    # --- CRUD Methods for BEOLOption ---
    def create_beol_option(self, data: schemas.product.BeolOptionCreate):
        return self.repository.create_beol_option(data.option_name, data.process_plan_id)

    def update_beol_option(self, id: int, data: schemas.product.BeolOptionUpdate):
        return self.repository.update_beol_option(id, data.option_name)

    def delete_beol_option(self, id: int):
        return self.repository.delete_beol_option(id)

    # --- CRUD Methods for Product ---
    def create_product(self, data: schemas.product.ProductCreate):
        return self.repository.create_product(data.partid, data.product_name, data.beol_option_id, data.meta_info)

    def update_product(self, id: int, data: schemas.product.ProductUpdate):
        return self.repository.update_product(id, data.partid, data.product_name, data.meta_info)

    def delete_product(self, id: int):
        return self.repository.delete_product(id)

    # --- CRUD Methods for RequestItem ---
    def create_request_item(self, data: schemas.product.RequestItemCreate):
        return self.repository.create_request_item(data)

    def update_request_item(self, id: int, data: schemas.product.RequestItemUpdate):
        return self.repository.update_request_item(id, data)

    def delete_request_item(self, id: int):
        return self.repository.delete_request_item(id)

    def list_request_items(self, product_id: Optional[int] = None):
        return self.repository.list_request_items(product_id)

    def get_request_references(self, request_id: int):
        return self.repository.get_request_references(request_id)
