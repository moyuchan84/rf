from sqlalchemy.orm import Session
from app.domain import models

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_process_plan(self, design_rule: str):
        obj = self.db.query(models.ProcessPlan).filter(models.ProcessPlan.design_rule == design_rule).first()
        if not obj:
            obj = models.ProcessPlan(design_rule=design_rule)
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def get_or_create_beol_option(self, option_name: str, process_plan_id: int):
        obj = self.db.query(models.BeolOption).filter(
            models.BeolOption.option_name == option_name,
            models.BeolOption.process_plan_id == process_plan_id
        ).first()
        if not obj:
            obj = models.BeolOption(option_name=option_name, process_plan_id=process_plan_id)
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def get_or_create_product(self, partid: str, product_name: str, beol_option_id: int):
        obj = self.db.query(models.Product).filter(
            models.Product.partid == partid,
            models.Product.beol_option_id == beol_option_id
        ).first()
        if not obj:
            obj = models.Product(partid=partid, product_name=product_name, beol_option_id=beol_option_id)
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def list_all_products(self):
        return self.db.query(models.Product).all()

    def get_hierarchy(self):
        # Eager loading을 사용하여 효율적으로 계층 구조를 가져옵니다.
        return self.db.query(models.ProcessPlan).all()

    # --- CRUD Methods ---
    def create_process_plan(self, design_rule: str):
        obj = models.ProcessPlan(design_rule=design_rule)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_process_plan(self, id: int, design_rule: str):
        obj = self.db.query(models.ProcessPlan).get(id)
        if obj:
            obj.design_rule = design_rule
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_process_plan(self, id: int):
        obj = self.db.query(models.ProcessPlan).get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()

    def create_beol_option(self, option_name: str, process_plan_id: int):
        obj = models.BeolOption(option_name=option_name, process_plan_id=process_plan_id)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_beol_option(self, id: int, option_name: str):
        obj = self.db.query(models.BeolOption).get(id)
        if obj:
            obj.option_name = option_name
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_beol_option(self, id: int):
        obj = self.db.query(models.BeolOption).get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()

    def create_product(self, partid: str, product_name: str, beol_option_id: int):
        obj = models.Product(partid=partid, product_name=product_name, beol_option_id=beol_option_id)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_product(self, id: int, partid: str, product_name: str):
        obj = self.db.query(models.Product).get(id)
        if obj:
            obj.partid = partid
            obj.product_name = product_name
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_product(self, id: int):
        obj = self.db.query(models.Product).get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
