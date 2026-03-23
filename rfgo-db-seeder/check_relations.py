import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

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

def check_relations():
    db = SessionLocal()
    try:
        # Check if requester_id exists in users table
        print("Checking requester_id in request_items...")
        results = db.execute(text("""
            SELECT ri.id, ri.requester_id, u.user_id 
            FROM request_items ri 
            LEFT JOIN users u ON ri.requester_id = u.user_id 
            LIMIT 10
        """)).fetchall()
        for row in results:
            print(f"Request ID: {row[0]}, Requester ID: {row[1]}, Matched User ID: {row[2]}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_relations()
