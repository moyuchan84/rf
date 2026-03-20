from sqlalchemy.orm import Session
from app.domain import models
from app.domain import schemas
from typing import List, Optional

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
            models.Product.product_name == product_name,
            models.Product.beol_option_id == beol_option_id
        ).first()
        if not obj:
            # If not found with all 3, check if partid already exists to avoid UniqueConstraint error
            existing_by_partid = self.db.query(models.Product).filter(models.Product.partid == partid).first()
            if existing_by_partid:
                # Update existing product if partid matches but other info differs
                existing_by_partid.product_name = product_name
                existing_by_partid.beol_option_id = beol_option_id
                self.db.commit()
                self.db.refresh(existing_by_partid)
                return existing_by_partid
            
            obj = models.Product(partid=partid, product_name=product_name, beol_option_id=beol_option_id)
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def list_all_products(self):
        return self.db.query(models.Product).all()

    def get_product_by_partid(self, partid: str):
        return self.db.query(models.Product).filter(models.Product.partid == partid).first()

    def get_hierarchy(self):
        return self.db.query(models.ProcessPlan).all()

    # --- CRUD Methods for ProcessPlan ---
    def create_process_plan(self, design_rule: str):
        obj = models.ProcessPlan(design_rule=design_rule)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_process_plan(self, id: int, design_rule: str):
        obj = self.db.query(models.ProcessPlan).filter(models.ProcessPlan.id == id).first()
        if obj:
            obj.design_rule = design_rule
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_process_plan(self, id: int):
        obj = self.db.query(models.ProcessPlan).filter(models.ProcessPlan.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()

    # --- CRUD Methods for BEOLOption ---
    def create_beol_option(self, option_name: str, process_plan_id: int):
        obj = models.BeolOption(option_name=option_name, process_plan_id=process_plan_id)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_beol_option(self, id: int, option_name: str):
        obj = self.db.query(models.BeolOption).filter(models.BeolOption.id == id).first()
        if obj:
            obj.option_name = option_name
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_beol_option(self, id: int):
        obj = self.db.query(models.BeolOption).filter(models.BeolOption.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()

    # --- CRUD Methods for Product ---
    def create_product(self, partid: str, product_name: str, beol_option_id: int, meta_info: Optional[schemas.product.ProductMetaCreate] = None):
        obj = models.Product(partid=partid, product_name=product_name, beol_option_id=beol_option_id)
        if meta_info:
            obj.meta_info = models.ProductMeta(**meta_info.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_product(self, id: int, partid: str = None, product_name: str = None, meta_info: Optional[schemas.product.ProductMetaCreate] = None):
        obj = self.db.query(models.Product).filter(models.Product.id == id).first()
        if obj:
            if partid:
                obj.partid = partid
            if product_name:
                obj.product_name = product_name
            if meta_info:
                if obj.meta_info:
                    for key, value in meta_info.model_dump().items():
                        setattr(obj.meta_info, key, value)
                else:
                    obj.meta_info = models.ProductMeta(**meta_info.model_dump())
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_product(self, id: int):
        obj = self.db.query(models.Product).filter(models.Product.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()

    # --- CRUD Methods for RequestItem ---
    def create_request_item(self, data: schemas.product.RequestItemCreate):
        obj = models.RequestItem(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_request_item(self, id: int, data: schemas.product.RequestItemUpdate):
        obj = self.db.query(models.RequestItem).filter(models.RequestItem.id == id).first()
        if obj:
            update_data = data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(obj, key, value)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete_request_item(self, id: int):
        obj = self.db.query(models.RequestItem).filter(models.RequestItem.id == id).first()
        if obj:
            self.db.delete(obj)
            self.db.commit()

    def list_request_items(self, product_id: Optional[int] = None):
        query = self.db.query(models.RequestItem)
        if product_id:
            query = query.filter(models.RequestItem.product_id == product_id)
        return query.order_by(models.RequestItem.created_at.desc()).all()
