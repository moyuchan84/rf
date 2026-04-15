import os
import sys
import random
import copy
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, text, Float, Text, ARRAY, Boolean, JSON, LargeBinary
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timedelta
from dotenv import load_dotenv

# .env 로드
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

# --- Models ---

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    epid = Column(String, unique=True, index=True)
    user_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    dept_name = Column(String)
    email = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProcessPlan(Base):
    __tablename__ = "process_plans"
    id = Column(Integer, primary_key=True, index=True)
    design_rule = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BeolGroup(Base):
    __tablename__ = "beol_groups"
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    beol_group_id = Column(Integer, ForeignKey("beol_groups.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    partid = Column(String, unique=True, index=True)
    product_name = Column(String, index=True)
    beol_option_id = Column(Integer, ForeignKey("beol_options.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RequestItem(Base):
    __tablename__ = "request_items"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    request_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    edm_list = Column(ARRAY(String), default=[])
    pkd_versions = Column(ARRAY(String), default=[])
    requester_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RequestStep(Base):
    __tablename__ = "request_steps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    step_order = Column(Integer, nullable=False)
    step_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    work_content = Column(Text, nullable=True)
    worker_id = Column(String, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class RequestAssignee(Base):
    __tablename__ = "request_assignees"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    category = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)

class PhotoKey(Base):
    __tablename__ = "photo_keys"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
    beol_group_id = Column(Integer, ForeignKey("beol_groups.id", ondelete="CASCADE"))
    rfg_category = Column(String)
    photo_category = Column(String)
    is_reference = Column(Boolean, default=False)
    table_name = Column(String)
    rev_no = Column(Integer)
    workbook_data = Column(JSON)
    raw_binary = Column(LargeBinary, nullable=True)
    filename = Column(String)
    updater = Column(String)
    log = Column(Text, nullable=True)
    update_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StreamInfo(Base):
    __tablename__ = "stream_info"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    product_id = Column(Integer, nullable=False)
    process_plan_id = Column(Integer, nullable=False)
    beol_group_id = Column(Integer, ForeignKey("beol_groups.id", ondelete="CASCADE"))
    stream_path = Column(String, nullable=False)
    stream_input_output_file = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RequestTableMap(Base):
    __tablename__ = "request_table_maps"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("request_items.id", ondelete="CASCADE"))
    product_id = Column(Integer, nullable=True)
    process_plan_id = Column(Integer, nullable=True)
    beol_group_id = Column(Integer, ForeignKey("beol_groups.id", ondelete="CASCADE"), nullable=True)
    photo_key_id = Column(Integer, ForeignKey("photo_keys.id", ondelete="CASCADE"))
    type = Column(String, nullable=False) # REFERENCE, SETUP

class N7MaskBeol(Base):
    __tablename__ = "n7_maskbeol"
    __table_args__ = {"schema": "smartdne"}
    id = Column(Integer, primary_key=True, index=True)
    obid = Column(String(24))
    n7beol = Column(String(20))
    n7process_grp = Column(String(20))
    n7make_date = Column(String(20))
    n7make_id = Column(String(20))
    n7make_name = Column(String(60))
    n7make_teamname = Column(String(60))
    n7modify_date = Column(String(20))
    n7modify_id = Column(String(20))
    n7modify_name = Column(String(20))
    n7modify_teamname = Column(String(60))
    n7use_flag = Column(String(1))
    n7make_id_jmody = Column(String(1))
    n7modify_id_jmody = Column(String(1))
    n7customer_flag = Column(String(3))
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Seeding Logic ---

def clear_data(db):
    print("--- Clearing existing data ---")
    tables = [
        "request_table_maps", "stream_info", "photo_keys", "request_assignees", 
        "request_steps", "request_items", "products", "beol_options", 
        "beol_groups", "process_plans", "users", "roles"
    ]
    for table in tables:
        db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
    db.commit()

def seed_roles(db):
    print("--- Seeding Roles ---")
    roles = [
        {"name": "ADMIN", "description": "System Administrator"},
        {"name": "RFG", "description": "RFG Photo Key Manager"},
        {"name": "INNO", "description": "Innovation Rule Designer"},
        {"name": "USER", "description": "General System User"},
    ]
    for r_data in roles:
        db.add(Role(**r_data))
    db.commit()

def seed_users(db):
    print("--- Seeding Users ---")
    role_map = {r.name: r.id for r in db.query(Role).all()}
    
    essentials = [
        ("admin_user", "11112222", "Admin Manager", "ADMIN"),
        ("rfg_manager", "22223333", "RFG Expert", "RFG"),
        ("regular_dev", "99990000", "Junior Engineer", "USER"),
    ]
    for uid, ep, name, rname in essentials:
        db.add(User(user_id=uid, epid=ep, full_name=name, dept_name="HQ", email=f"{uid}@samsung.com", role_id=role_map[rname]))
    
    for i in range(1, 51):
        uid = f"user_{i:03d}"
        db.add(User(
            user_id=uid, epid=f"EP{80000000+i}", 
            full_name=f"Test User {i:03d}", 
            dept_name=random.choice(["Memory", "Foundry", "LSI"]),
            email=f"test{i}@samsung.com", 
            role_id=role_map["USER"]
        ))
    db.commit()

def seed_master_data(db):
    print("--- Seeding Master Data (Plan > Group > Option) ---")
    plan_names = ["14nm_GAA", "7nm_EUV", "5nm_FinFET", "3nm_GAA_V1", "2nm_NextGen"]
    plans = []
    for p_name in plan_names:
        p = ProcessPlan(design_rule=p_name)
        db.add(p)
        plans.append(p)
    db.flush()
    
    options_to_seed = [
        "700000_Standard", "700000_HighDensity", 
        "800000_LowPower", "800000_Special",
        "900000_Ultra", "900000_Core"
    ]
    
    all_options = []
    for p in plans:
        groups = {}
        for opt_full_name in options_to_seed:
            prefix = opt_full_name.split('_')[0]
            if prefix not in groups:
                bg = BeolGroup(group_name=prefix, process_plan_id=p.id)
                db.add(bg)
                db.flush()
                groups[prefix] = bg
            
            bo = BeolOption(option_name=opt_full_name, beol_group_id=groups[prefix].id)
            db.add(bo)
            all_options.append(bo)
    db.flush()
    
    products_created = []
    for i in range(1, 31):
        pid = f"PART_{i:04d}"
        target_bo = random.choice(all_options)
        p = Product(
            partid=pid, product_name=f"Chipset_XYZ_{i}", beol_option_id=target_bo.id
        )
        db.add(p)
        products_created.append(p)
    db.commit()
    return products_created

def create_mock_workbook(filename, table_name, rev_no=1, variation_seed=0):
    processed_data = [
        {"col_0": "K101", "col_1": 10.5 + variation_seed, "col_2": -42.1, "col_3": "ALIGN", "col_4": 80.0},
        {"col_0": "OVL1", "col_1": -12.0, "col_2": -5.5, "col_3": "OVERLAY", "col_4": 45.0}
    ]
    return {
        "Meta": {"FileName": filename, "Revision": rev_no, "SuggestedTableName": table_name},
        "Worksheets": [
            {
                "SheetName": "DATA_SHEET", "SheetType": "DATA", "Origin": {"Row": 1, "Col": 1},
                "Columns": [
                    {"Key": "col_0", "Name": "KEY_ID", "Index": 0},
                    {"Key": "col_1", "Name": "POS_X", "Index": 1},
                    {"Key": "col_2", "Name": "POS_Y", "Index": 2},
                    {"Key": "col_3", "Name": "TYPE", "Index": 3},
                    {"Key": "col_4", "Name": "SIZE", "Index": 4}
                ],
                "TableData": processed_data
            }
        ]
    }

def seed_photo_keys(db):
    print("--- Seeding Photo Keys ---")
    products = db.query(Product).all()
    bo_map = {bo.id: bo for bo in db.query(BeolOption).all()}
    bg_map = {bg.id: bg for bg in db.query(BeolGroup).all()}
    
    common_table_names = ["GLOBAL_ALIGN_STANDARD", "GOLDEN_OVERLAY_RULE"]
    all_keys = []
    
    for table_name in common_table_names:
        for prod in random.sample(products, 10):
            bo = bo_map[prod.beol_option_id]
            bg = bg_map[bo.beol_group_id]
            for rev in range(1, 3):
                filename = f"MASTER_{table_name}_{bg.group_name}_R{rev}.xlsx"
                pk = PhotoKey(
                    product_id=prod.id, process_plan_id=bg.process_plan_id, beol_group_id=bg.id,
                    rfg_category="common", photo_category="key", is_reference=(rev == 1),
                    table_name=table_name, rev_no=rev, workbook_data=create_mock_workbook(filename, table_name, rev),
                    filename=filename, updater="admin_user"
                )
                db.add(pk)
                all_keys.append(pk)
    db.commit()
    return all_keys

def seed_requests_and_stream(db, all_photo_keys):
    print("--- Seeding Requests, Table Maps, and Stream Info ---")
    products = db.query(Product).all()
    users = db.query(User).all()
    bo_map = {bo.id: bo for bo in db.query(BeolOption).all()}
    bg_map = {bg.id: bg for bg in db.query(BeolGroup).all()}
    
    step_names = ['ReferenceTable', 'KeyTableSetup', 'RequestSubmission', 'GDSPath', 'StreamInfo']

    for i in range(1, 201):
        prod = random.choice(products)
        bo = bo_map[prod.beol_option_id]
        bg = bg_map[bo.beol_group_id]
        requester = random.choice(users)
        
        request = RequestItem(
            product_id=prod.id, request_type=random.choice(["new", "rev"]),
            title=f"Request {i:03d} for {prod.partid}",
            requester_id=requester.user_id, created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(request)
        db.flush()

        # 1. Steps
        for idx, name in enumerate(step_names):
            db.add(RequestStep(
                request_id=request.id, step_order=idx + 1, step_name=name,
                status=random.choice(["TODO", "IN_PROGRESS", "DONE"]), worker_id=random.choice(users).user_id
            ))
            
        # 2. Table Maps (REFERENCE)
        sample_keys = random.sample(all_photo_keys, min(len(all_photo_keys), 2))
        for pk in sample_keys:
            db.add(RequestTableMap(
                request_id=request.id, photo_key_id=pk.id, type="REFERENCE",
                product_id=pk.product_id, process_plan_id=pk.process_plan_id, beol_group_id=pk.beol_group_id
            ))
            
        # 3. Stream Info (Linking to Request and its Group)
        db.add(StreamInfo(
            request_id=request.id,
            product_id=prod.id,
            process_plan_id=bg.process_plan_id,
            beol_group_id=bg.id,
            stream_path=f"//NAS/GDS/STREAM/{prod.partid}/",
            stream_input_output_file=f"{prod.partid}_STREAM_V{i:03d}.gds"
        ))
        
    db.commit()

def run_seed():
    db = SessionLocal()
    try:
        clear_data(db)
        seed_roles(db)
        seed_users(db)
        seed_master_data(db)
        keys = seed_photo_keys(db)
        seed_requests_and_stream(db, keys)
        print("\nFull Seeding (including Group-based StreamInfo) completed successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
