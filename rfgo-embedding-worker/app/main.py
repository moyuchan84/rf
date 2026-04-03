import json
import asyncio
from faststream import FastStream
from faststream.redis import RedisBroker
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from .core.config import settings
from .domain.models.models import PhotoKey, PhotoKeyEmbedding
from .infrastructure.providers import get_embedding_provider

# Infrastructure
broker = RedisBroker(settings.REDIS_URL)
app = FastStream(broker)
engine = create_engine(settings.sqlalchemy_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

embedding_provider = get_embedding_provider()

def chunk_photo_key(photo_key: PhotoKey) -> str:
    """
    Skill 1: Convert WorkbookData JSON to contextual text for RAG.
    Format: [TableName] (Rev: X) | SheetName: metadata | Row data...
    """
    wb_data = photo_key.workbook_data
    if not wb_data:
        return f"PhotoKey ID: {photo_key.id} Table: {photo_key.table_name} (No data)"

    # Base context
    context_parts = [
        f"PhotoKey Table: {photo_key.table_name}",
        f"Revision: {photo_key.rev_no}",
    ]

    # Process worksheets
    worksheets = wb_data.get("worksheets", [])
    for sheet in worksheets:
        sheet_name = sheet.get("sheet_name", "Unknown")
        meta = sheet.get("meta", {})
        rows = sheet.get("rows", [])
        
        # Metadata chunk
        meta_str = ", ".join([f"{k}: {v}" for k, v in meta.items()])
        context_parts.append(f"Sheet: {sheet_name} | Meta: {meta_str}")

        # Row sample/summary (limit to first 10 rows for context brevity)
        row_contents = []
        for row in rows[:10]:
            row_str = ", ".join([f"{k}: {v}" for k, v in row.items()])
            row_contents.append(row_str)
        
        if row_contents:
            context_parts.append(f"Data: {' | '.join(row_contents)}")

    return "\n".join(context_parts)

@broker.subscriber("photo_key.created")
async def handle_embedding_task(data: dict):
    photo_key_id = data.get("id")
    if not photo_key_id:
        return

    print(f"Processing embedding for PhotoKey ID: {photo_key_id}")
    
    with SessionLocal() as session:
        # 1. Fetch PhotoKey
        photo_key = session.get(PhotoKey, photo_key_id)
        if not photo_key:
            print(f"PhotoKey {photo_key_id} not found in DB.")
            return

        # 2. Text Chunking
        content_text = chunk_photo_key(photo_key)
        
        # 3. Vector Embedding
        try:
            vector = await embedding_provider.get_embedding(content_text)
            
            # 4. Save to PGVector
            # Check if embedding already exists (for idempotency)
            existing = session.execute(
                select(PhotoKeyEmbedding).where(PhotoKeyEmbedding.photo_key_id == photo_key_id)
            ).scalar_one_or_none()
            
            if existing:
                existing.embedding = vector
                existing.content = content_text
            else:
                new_embedding = PhotoKeyEmbedding(
                    photo_key_id=photo_key_id,
                    embedding=vector,
                    content=content_text
                )
                session.add(new_embedding)
            
            session.commit()
            print(f"Embedding completed for PhotoKey ID: {photo_key_id}")
            
        except Exception as e:
            print(f"Error during embedding for ID {photo_key_id}: {e}")
            session.rollback()

if __name__ == "__main__":
    import asyncio
    asyncio.run(app.run())
