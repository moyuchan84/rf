import asyncio
import redis
import json
from sqlalchemy import create_engine, select, text
from app.config import settings

def backfill():
    # Setup Redis
    r = redis.from_url(settings.REDIS_URL)
    
    # Setup DB
    engine = create_engine(settings.sqlalchemy_database_url)
    
    # Query for PhotoKeys without embeddings
    query = text("""
        SELECT pk.id FROM photo_keys pk
        LEFT JOIN photo_key_embeddings pke ON pk.id = pke.photo_key_id
        WHERE pke.id IS NULL
    """)
    
    print("Searching for photo keys without embeddings...")
    with engine.connect() as conn:
        results = conn.execute(query).fetchall()
        
    ids = [row[0] for row in results]
    print(f"Found {len(ids)} photo keys for backfilling.")

    for photo_key_id in ids:
        # Publish to the same Redis channel
        event_data = {"id": photo_key_id}
        r.publish("photo_key.created", json.dumps(event_data))
        print(f"Published backfill event for ID: {photo_key_id}")

    print("Backfill event publishing completed.")

if __name__ == "__main__":
    backfill()
