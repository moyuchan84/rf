import os
import sys
import random
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

class BeolOption(Base):
    __tablename__ = "beol_options"
    id = Column(Integer, primary_key=True, index=True)
    option_name = Column(String, index=True)
    process_plan_id = Column(Integer, ForeignKey("process_plans.id", ondelete="CASCADE"))
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
    beol_option_id = Column(Integer, ForeignKey("beol_options.id", ondelete="CASCADE"))
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
    beol_option_id = Column(Integer, nullable=False)
    stream_path = Column(String, nullable=False)
    stream_input_output_file = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- Seeding Logic ---

def seed_roles(db):
    print("--- Seeding Roles ---")
    roles = [
        {"name": "ADMIN", "description": "System Administrator"},
        {"name": "RFG", "description": "RFG Photo Key Manager"},
        {"name": "INNO", "description": "Innovation Rule Designer"},
        {"name": "USER", "description": "General System User"},
    ]
    for r_data in roles:
        if not db.query(Role).filter(Role.name == r_data["name"]).first():
            db.add(Role(**r_data))
    db.commit()

def seed_users(db):
    print("--- Seeding Users ---")
    role_map = {r.name: r.id for r in db.query(Role).all()}
    
    # Essential users
    essentials = [
        ("admin_user", "11112222", "Admin Manager", "ADMIN"),
        ("rfg_manager", "22223333", "RFG Expert", "RFG"),
        ("regular_dev", "99990000", "Junior Engineer", "USER"),
    ]
    for uid, ep, name, rname in essentials:
        if not db.query(User).filter(User.user_id == uid).first():
            db.add(User(user_id=uid, epid=ep, full_name=name, dept_name="HQ", email=f"{uid}@samsung.com", role_id=role_map[rname]))
    
    # Bulk users for search/pagination testing
    for i in range(1, 51):
        uid = f"user_{i:03d}"
        if not db.query(User).filter(User.user_id == uid).first():
            db.add(User(
                user_id=uid, epid=f"EP{80000000+i}", 
                full_name=f"Test User {i:03d}", 
                dept_name=random.choice(["Memory", "Foundry", "LSI"]),
                email=f"test{i}@samsung.com", 
                role_id=role_map["USER"]
            ))
    db.commit()

def seed_master_data(db):
    print("--- Seeding Master Data ---")
    # Process Plans
    plans = ["14nm_GAA", "7nm_EUV", "5nm_FinFET", "3nm_GAA_V1", "2nm_NextGen"]
    for p_name in plans:
        if not db.query(ProcessPlan).filter(ProcessPlan.design_rule == p_name).first():
            db.add(ProcessPlan(design_rule=p_name))
    db.commit()
    
    plan_ids = [p.id for p in db.query(ProcessPlan).all()]
    
    # Beol Options
    for pid in plan_ids:
        for opt in ["Standard", "HighDensity", "LowPower"]:
            if not db.query(BeolOption).filter(BeolOption.process_plan_id == pid, BeolOption.option_name == opt).first():
                db.add(BeolOption(option_name=opt, process_plan_id=pid))
    db.commit()
    
    beol_ids = [b.id for b in db.query(BeolOption).all()]
    
    # Products
    for i in range(1, 31):
        pid = f"PART_{i:04d}"
        if not db.query(Product).filter(Product.partid == pid).first():
            db.add(Product(
                partid=pid, 
                product_name=f"Chipset_XYZ_{i}", 
                beol_option_id=random.choice(beol_ids)
            ))
    db.commit()

def seed_requests(db):
    print("--- Seeding 200 Requests ---")
    products = db.query(Product).all()
    users = db.query(User).all()
    req_types = ["new", "rev", "rev_special"] # From types.ts
    statuses = ["TODO", "IN_PROGRESS", "DONE", "REJECTED"]
    
    step_names = ['ReferenceTable', 'KeyTableSetup', 'RequestSubmission', 'GDSPath', 'StreamInfo']

    for i in range(1, 201):
        prod = random.choice(products)
        requester = random.choice(users)
        rtype = random.choice(req_types)
        
        # Create request item with spread out creation dates for pagination testing
        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
        
        request = RequestItem(
            product_id=prod.id,
            request_type=rtype,
            title=f"Request for {prod.product_name} - Batch {i:03d}",
            description=f"Auto-generated mock request for testing pagination and filters. Index: {i}",
            edm_list=[f"http://edm.samsung.com/v{random.randint(1,10)}"],
            pkd_versions=[f"v{random.randint(1,5)}.{random.randint(0,9)}"],
            requester_id=requester.user_id,
            created_at=created_at
        )
        db.add(request)
        db.flush() # Get request.id

        # 5 Default Steps
        for idx, name in enumerate(step_names):
            step_status = random.choice(statuses)
            db.add(RequestStep(
                request_id=request.id,
                step_order=idx + 1,
                step_name=name,
                status=step_status,
                worker_id=random.choice(users).user_id if step_status != "TODO" else None,
                completed_at=datetime.utcnow() if step_status == "DONE" else None
            ))
            
        # Assignees
        for cat in ["RFG", "INNO"]:
            assignee = random.choice([u for u in users if u.user_id != requester.user_id])
            db.add(RequestAssignee(
                request_id=request.id,
                category=cat,
                user_id=assignee.user_id,
                user_name=assignee.full_name
            ))

    db.commit()
    print("Requests seeding finished.")

def create_mock_workbook(filename, table_name):
    """Generates a simplified WorkbookData JSON structure."""
    return {
        "Meta": {
            "FileName": filename,
            "FullPath": f"C:\\Users\\Mock\\Documents\\{filename}",
            "Revision": random.randint(1, 5),
            "SuggestedTableName": table_name
        },
        "Worksheets": [
            {
                "SheetName": "HISTORY",
                "SheetType": "HISTORY",
                "Origin": {"Row": 1, "Col": 1},
                "Columns": [
                    {"Key": "col_0", "Name": "REV", "Index": 0},
                    {"Key": "col_1", "Name": "DATE", "Index": 1},
                    {"Key": "col_2", "Name": "AUTHOR", "Index": 2},
                    {"Key": "col_3", "Name": "LOG", "Index": 3}
                ],
                "TableData": [
                    {"col_0": "1.0", "col_1": "2024-01-01", "col_2": "admin", "col_3": "Initial Setup"},
                    {"col_0": "1.1", "col_1": "2024-02-15", "col_2": "rfg_manager", "col_3": "Updated ALIGN markers"}
                ],
                "MetaInfo": {}
            },
            {
                "SheetName": "DATA_SHEET",
                "SheetType": "DATA",
                "Origin": {"Row": 1, "Col": 1},
                "PhotoCategory": "key",
                "MetaInfo": {
                    "Product": "MOCK_PROD",
                    "Step": "PHOTO_STEP_01",
                    "Revision": "1.1"
                },
                "Columns": [
                    {"Key": "col_0", "Name": "KEY_ID", "Index": 0},
                    {"Key": "col_1", "Name": "POS_X", "Index": 1},
                    {"Key": "col_2", "Name": "POS_Y", "Index": 2},
                    {"Key": "col_3", "Name": "TYPE", "Index": 3},
                    {"Key": "col_4", "Name": "SIZE", "Index": 4}
                ],
                "TableData": [
                    {"col_0": "K101", "col_1": 10.523, "col_2": -42.112, "col_3": "ALIGN", "col_4": 80.0},
                    {"col_0": "K102", "col_1": 50.112, "col_2": 12.887, "col_3": "ALIGN", "col_4": 80.0},
                    {"col_0": "OVL1", "col_1": -12.000, "col_2": -5.500, "col_3": "OVERLAY", "col_4": 45.0},
                    {"col_0": "OVL2", "col_1": 112.44, "col_2": 88.33, "col_3": "OVERLAY", "col_4": 45.0}
                ]
            }
        ]
    }

def seed_photo_keys(db):
    print("--- Seeding Photo Keys ---")
    products = db.query(Product).all()
    beol_options = {b.id: b.process_plan_id for b in db.query(BeolOption).all()}
    
    for prod in random.sample(products, 15):  # Seed for 15 products
        plan_id = beol_options[prod.beol_option_id]
        
        # Create 2-3 PhotoKeys per product
        for i in range(random.randint(2, 3)):
            table_name = f"PK_{prod.partid}_{['ALIGN', 'OVERLAY', 'META'][i % 3]}"
            filename = f"PHOTO_KEY_{prod.partid}_R{i+1}.xlsx"
            
            pk = PhotoKey(
                product_id=prod.id,
                process_plan_id=plan_id,
                beol_option_id=prod.beol_option_id,
                rfg_category=random.choice(["common", "option"]),
                photo_category=random.choice(["key", "info"]),
                is_reference=(i == 0),
                table_name=table_name,
                rev_no=i + 1,
                workbook_data=create_mock_workbook(filename, table_name),
                raw_binary=b"dummy binary content",
                filename=filename,
                updater="admin_user",
                log=f"Auto-generated mock data for {prod.partid} rev {i+1}"
            )
            db.add(pk)
    db.commit()

def seed_stream_info(db):
    print("--- Seeding Stream Info ---")
    requests = db.query(RequestItem).all()
    products = {p.id: p for p in db.query(Product).all()}
    beol_options = {b.id: b.process_plan_id for b in db.query(BeolOption).all()}

    # Seed for 50 requests
    for req in random.sample(requests, 50):
        prod = products[req.product_id]
        plan_id = beol_options[prod.beol_option_id]
        
        si = StreamInfo(
            request_id=req.id,
            product_id=prod.id,
            process_plan_id=plan_id,
            beol_option_id=prod.beol_option_id,
            stream_path=f"//NAS/GDS/STREAM/{prod.partid}/{req.id}_output.gds",
            stream_input_output_file=f"STREAM_INFO_FOR_REQUEST_{req.id}\nVERSION: 1.0\nLAYERS: 1, 2, 3, 4, 5\nPROCESS: {plan_id}"
        )
        db.add(si)
    db.commit()

def run_seed():
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_users(db)
        seed_master_data(db)
        seed_requests(db)
        seed_photo_keys(db)
        seed_stream_info(db)
        print("\nAll Seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
