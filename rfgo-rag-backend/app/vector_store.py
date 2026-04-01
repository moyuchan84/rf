from typing import List
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, joinedload
from openai import AsyncOpenAI
from .config import settings
from .models import PhotoKey, PhotoKeyEmbedding, Product, ProcessPlan, BeolOption

class VectorStore:
    def __init__(self):
        self.engine = create_engine(settings.sqlalchemy_database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_embedding(self, text: str) -> List[float]:
        response = await self.client.embeddings.create(
            input=text,
            model=settings.EMBEDDING_MODEL
        )
        return response.data[0].embedding

    async def similarity_search(self, query: str, k: int = 5):
        query_vector = await self.get_embedding(query)
        
        with self.SessionLocal() as session:
            # Join with Product, ProcessPlan, and BeolOption to get rich context
            results = session.query(
                PhotoKeyEmbedding.content,
                PhotoKeyEmbedding.photo_key_id,
                PhotoKeyEmbedding.embedding.cosine_distance(query_vector).label("distance"),
                PhotoKey.table_name,
                PhotoKey.rev_no,
                Product.partid.label("partid"),
                Product.product_name.label("product_name"),
                ProcessPlan.design_rule.label("design_rule"),
                BeolOption.option_name.label("beol_option_name")
            ).join(PhotoKey, PhotoKeyEmbedding.photo_key_id == PhotoKey.id)\
             .outerjoin(Product, PhotoKey.product_id == Product.id)\
             .outerjoin(ProcessPlan, PhotoKey.process_plan_id == ProcessPlan.id)\
             .outerjoin(BeolOption, PhotoKey.beol_option_id == BeolOption.id)\
             .order_by("distance")\
             .limit(k)\
             .all()
            
            return [
                {
                    "content": r.content,
                    "id": r.photo_key_id,
                    "table_name": r.table_name,
                    "rev_no": r.rev_no,
                    "product_info": {
                        "partid": r.partid,
                        "name": r.product_name,
                        "design_rule": r.design_rule,
                        "beol_option": r.beol_option_name
                    },
                    "score": 1 - r.distance
                }
                for r in results
            ]

vector_store = VectorStore()
