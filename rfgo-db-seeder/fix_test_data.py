import os
import random
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, text, Float, Text, ARRAY, Boolean, JSON, LargeBinary
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# .env loading
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("DB_USER", "admin")
    password = os.getenv("DB_PASSWORD", "password123")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5433")
    db_name = os.getenv("DB_NAME", "photokey_db")
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models Matching Schema ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id"))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    partid = Column(String, unique=True, index=True)
    product_name = Column(String)
    beol_option_id = Column(Integer, ForeignKey("beol_options.id"))

class ProductMeta(Base):
    __tablename__ = "product_meta"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True)
    chip_size_x = Column(Float)
    chip_size_y = Column(Float)
    sl_size_x = Column(Float)
    sl_size_y = Column(Float)

class RequestItem(Base):
    __tablename__ = "request_items"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    request_type = Column(String)
    title = Column(String)
    requester_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    process_plan_id = Column(Integer, ForeignKey("process_plans.id"))
    beol_option_id = Column(Integer, ForeignKey("beol_options.id"))
    rfg_category = Column(String)
    photo_category = Column(String)
    is_reference = Column(Boolean, default=False)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    filename = Column(String)
    updater = Column(String)
    update_date = Column(DateTime, default=datetime.utcnow)

class StreamInfo(Base):
    __tablename__ = "stream_info"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id"))
    product_id = Column(Integer)
    process_plan_id = Column(Integer)
    beol_option_id = Column(Integer)
    stream_path = Column(String)

class RequestTableMap(Base):
    __tablename__ = "request_table_maps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id"))
    product_id = Column(Integer)
    process_plan_id = Column(Integer)
    beol_option_id = Column(Integer)
    photo_key_id = Column(Integer, ForeignKey("photo_keys.id"))
    type = Column(String) # REFERENCE, SETUP

class RequestStep(Base):
    __tablename__ = "request_steps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id"))
    step_order = Column(Integer)
    step_name = Column(String)
    status = Column(String)

def create_mock_workbook(filename, table_name, rev=1):
    return {
        "Meta": {"FileName": filename, "Revision": rev, "SuggestedTableName": table_name},
        "Worksheets": [{"SheetName": "DATA", "SheetType": "DATA", "TableData": []}]
    }

def fix_data():
    db = SessionLocal()
    try:
        print("--- Wiping transient tables ---")
        db.execute(text("TRUNCATE TABLE request_table_maps CASCADE"))
        db.execute(text("TRUNCATE TABLE stream_info CASCADE"))
        db.execute(text("TRUNCATE TABLE photo_keys CASCADE"))
        db.execute(text("TRUNCATE TABLE request_steps CASCADE"))
        db.execute(text("TRUNCATE TABLE request_items CASCADE"))
        db.execute(text("TRUNCATE TABLE product_meta CASCADE"))
        db.commit()

        products = db.query(Product).all()
        beol_options = {b.id: b for b in db.query(BeolOption).all()}
        users = [u.user_id for u in db.query(User).all()]
        
        if not products or not users:
            print("Error: Required master data (products/users) missing.")
            return

        print(f"--- Processing {len(products)} products ---")
        
        for prod in products:
            beol = beol_options.get(prod.beol_option_id)
            if not beol: continue
            plan_id = beol.process_plan_id
            
            # 1. Product Meta
            db.add(ProductMeta(
                product_id=prod.id,
                chip_size_x=18.0, chip_size_y=12.0,
                sl_size_x=0.06, sl_size_y=0.06
            ))

            # 2. PhotoKeys (Multiple Revisions & Categories)
            # Combinations: (common/option) x (key/info)
            combos = [("common", "key"), ("common", "info"), ("option", "key"), ("option", "info")]
            all_pks = []
            
            for rfg_cat, photo_cat in combos:
                table_name = f"TBL_{prod.partid}_{rfg_cat.upper()}_{photo_cat.upper()}"
                # Create 3 revisions per combo
                for rev in range(1, 4):
                    pk = PhotoKey(
                        product_id=prod.id,
                        process_plan_id=plan_id,
                        beol_option_id=beol.id,
                        rfg_category=rfg_cat,
                        photo_category=photo_cat,
                        is_reference=(rev == 3), # Latest is reference
                        table_name=table_name,
                        rev_no=rev,
                        workbook_data=create_mock_workbook(f"{table_name}_v{rev}.xlsx", table_name, rev),
                        filename=f"{table_name}_v{rev}.xlsx",
                        updater="admin_user"
                    )
                    db.add(pk)
                    all_pks.append(pk)
            
            db.flush() # Get IDs

            # 3. Request
            req = RequestItem(
                product_id=prod.id,
                request_type="new",
                title=f"Setup Request for {prod.partid}",
                requester_id=random.choice(users)
            )
            db.add(req)
            db.flush()

            # 4. Request Steps
            for i, name in enumerate(["ReferenceTable", "KeyTableSetup", "StreamInfo"]):
                db.add(RequestStep(request_id=req.id, step_order=i+1, step_name=name, status="DONE" if i==0 else "TODO"))

            # 5. Stream Info
            db.add(StreamInfo(
                request_id=req.id,
                product_id=prod.id,
                process_plan_id=plan_id,
                beol_option_id=beol.id,
                stream_path=f"//SERVER/GDS/{prod.partid}/{req.id}.gds"
            ))

            # 6. Request Table Maps
            # Scenario A/B: SETUP (Latest) vs REFERENCE (Previous versions or other products)
            for pk in all_pks:
                if pk.rev_no == 3:
                    # Current Request Setup
                    db.add(RequestTableMap(
                        request_id=req.id,
                        product_id=prod.id,
                        process_plan_id=plan_id,
                        beol_option_id=beol.id,
                        photo_key_id=pk.id,
                        type="SETUP"
                    ))
                else:
                    # Previous versions as References
                    db.add(RequestTableMap(
                        request_id=req.id,
                        product_id=prod.id,
                        process_plan_id=plan_id,
                        beol_option_id=beol.id,
                        photo_key_id=pk.id,
                        type="REFERENCE"
                    ))

        db.commit()
        print("--- Database successfully updated for ReferenceTablePicker tests ---")

    except Exception as e:
        print(f"FAILED: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_data()
