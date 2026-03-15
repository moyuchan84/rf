from sqlalchemy.orm import Session
from app.infrastructure.repositories import ProductRepository

class ProductService:
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)

    def list_all_products(self):
        return self.repository.list_all_products()
