from sqlalchemy.orm import Session
from app.infrastructure.repositories import ProductRepository

class ProductService:
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)

    def list_all_products(self):
        return self.repository.list_all_products()

    def get_product_hierarchy(self):
        return self.repository.get_hierarchy()

    # --- CRUD Methods ---
    def create_process_plan(self, data):
        return self.repository.create_process_plan(data.design_rule)

    def update_process_plan(self, id, data):
        return self.repository.update_process_plan(id, data.design_rule)

    def delete_process_plan(self, id):
        return self.repository.delete_process_plan(id)

    def create_beol_option(self, data):
        return self.repository.create_beol_option(data.option_name, data.process_plan_id)

    def update_beol_option(self, id, data):
        return self.repository.update_beol_option(id, data.option_name)

    def delete_beol_option(self, id):
        return self.repository.delete_beol_option(id)

    def create_product(self, data):
        return self.repository.create_product(data.partid, data.product_name, data.beol_option_id)

    def update_product(self, id, data):
        return self.repository.update_product(id, data.partid, data.product_name)

    def delete_product(self, id):
        return self.repository.delete_product(id)
