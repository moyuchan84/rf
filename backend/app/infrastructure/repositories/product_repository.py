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
