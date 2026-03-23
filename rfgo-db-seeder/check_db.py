import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
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

def check_data():
    db = SessionLocal()
    try:
        tables = [
            "users", "process_plans", "beol_options", "products", 
            "request_items", "request_steps", "photo_keys", "stream_info", "request_table_maps"
        ]
        
        for table in tables:
            count = db.execute(text(f"SELECT count(*) FROM {table}")).scalar()
            print(f"Table {table}: {count} rows")
            
        if count > 0:
            print("\n--- Sample data from request_items ---")
            results = db.execute(text("SELECT id, product_id, title, request_type FROM request_items LIMIT 5")).fetchall()
            for row in results:
                print(row)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
