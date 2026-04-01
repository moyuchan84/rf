기존에 제안드렸던 **FastStream** 또는 **TaskIQ**와 같은 데코레이터 기반의 비동기 프레임워크를 활용하여, **Embedding Worker**를 RAG 백엔드와 분리하고 이를 공통된 컨텍스트로 개발하기 위한 **`GEMINI_RAG_GUIDE.md`** 가이드라인입니다.

이 가이드는 `gemini_cli`나 AI Agent가 코드를 생성할 때 **일관된 디자인 패턴(Adapter)**과 **클린 아키텍처**를 유지하도록 강제하는 규칙(Rules)과 기술(Skills)을 포함합니다.

---

# 📑 GEMINI_RAG_GUIDE.md: AI Agent Context & Development Rules

## 1. System Architecture (Component Definition)

시스템은 역할에 따라 3개의 파이썬 서비스로 분리하며, Redis Pub/Sub을 통해 느슨하게 결합됩니다.

1.  **`rfgo-vsto-fastapi` (Ingressor)**: VSTO 데이터를 수신하여 DB에 저장 후, Redis로 `photo_key.created` 이벤트를 발행.
2.  **`rfgo-embedding-worker` (Processor)**: `FastStream`을 사용하여 이벤트를 구독, 데이터를 텍스트화하고 벡터 임베딩 후 `pgvector`에 저장.
3.  **`rfgo-rag-backend` (Query Engine)**: `LangGraph`와 `FastMCP`를 사용하여 사용자의 질문을 분석, 벡터 검색 후 답변 생성.

---

## 2. Gemini CLI: Development Rules (강제 규칙)

AI Agent가 코드를 작성할 때 반드시 준수해야 하는 **Golden Rules**입니다.

### **Rule 1: Provider Interface (Adapter Pattern)**
모든 AI 연동(Embedding, LLM)은 추상 클래스를 먼저 정의한다. 사외(Ollama)와 사내(GPT-OSS) 환경 전환 시 **기존 비즈니스 로직을 수정하지 않고 클래스만 교체**하도록 설계한다.

### **Rule 2: Decorator-Based Worker (FastStream)**
Embedding Worker는 `FastStream`을 사용하며, Redis 브로커 연동 시 반드시 `@broker.subscriber` 데코레이터를 사용하여 선언적(Declarative)으로 작성한다.

### **Rule 3: Pydantic Domain Models**
모든 데이터 교환은 `Pydantic` 모델을 사용하며, `WorkbookData` 파싱 시 타입 안정성을 보장한다.

---

## 3. Skills: Contextual Intelligence (핵심 기술)

### **Skill 1: Workbook Content Chunking**
`WorkbookData`의 JSON 구조에서 `MetaInfo`와 `TableData`를 추출하여 RAG에 최적화된 **"문맥형 텍스트(Contextual Text)"**로 변환한다.
* **Input**: JSON Object
* **Logic**: `[SheetName] {Key: Value} | Column1: Val, Column2: Val...` 형식으로 직렬화.

### **Skill 2: Vector Migration (Legacy Support)**
이미 DB에 적재된 데이터를 위해 `FastStream` 워커에 별도의 `migration` 함수를 구현한다.
* **Logic**: `last_processed_id`를 추적하며 배치 단위로 읽어와 Redis Queue에 `Publish` 함으로써 신규 데이터와 동일한 파이프라인을 타게 한다.

---

## 4. Implementation Code Harness (보일러플레이트)

### **A. Embedding Worker (`worker.py` - FastStream 활용)**
```python
from faststream import FastStream
from faststream.redis import RedisBroker
from app.providers import get_embedding_provider

broker = RedisBroker("redis://localhost:6379")
app = FastStream(broker)
embedding_provider = get_embedding_provider() # Environment-based Switch

@broker.subscriber("photo_key.created")
async def handle_embedding_task(data: dict):
    photo_key_id = data.get("id")
    # 1. DB에서 WorkbookData 조회
    # 2. Text Chunking (Skill 1 적용)
    # 3. Vector Embedding (Rule 1 적용)
    # 4. PGVector 저장 (SQLAlchemy/SQLModel)
    print(f"Embedding completed for ID: {photo_key_id}")
```

### **B. RAG Backend (`main.py` - FastMCP & LangGraph)**
```python
from fastmcp import FastMCP
from langgraph.graph import StateGraph
from app.agents import rfg_specialist_agent

mcp = FastMCP("RFGo-RAG-Server")

@mcp.tool()
async def search_photo_key(query: string):
    """pgvector를 검색하여 관련 PhotoKey 정보를 반환합니다."""
    return await vector_store.similarity_search(query)

# LangGraph 기반 대화 엔진 구성
workflow = StateGraph(State)
workflow.add_node("retrieve", search_photo_key)
# ... Graph 설정
```

---

## 5. Infrastructure: Docker-Compose (Local Testing)

`pgvector`와 `Redis`를 즉시 가동하기 위한 설정입니다.

```yaml
version: '3.8'

services:
  # 1. PostgreSQL Database with pgvector
  # RAG 검색을 위해 일반 postgres 이미지를 pgvector가 포함된 이미지로 교체합니다.
  rfgo-db:
    image: ankane/pgvector:v0.5.1 # pgvector 확장 기능이 사전 설치된 이미지
    container_name: rfgo-db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: photokey_db
    ports:
      - "5433:5432"
    volumes:
      - rfgo-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d photokey_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Redis for Pub/Sub (New)
  # vsto-fastapi와 embedding-worker 사이의 비동기 통신을 위한 메시지 브로커입니다.
  rfgo-redis:
    image: redis:7-alpine
    container_name: rfgo-redis
    ports:
      - "6379:6379"
    restart: always

volumes:
  rfgo-db-data:
```

---

## 6. Hybrid Transition Strategy (사외 -> 사내)

| 환경 | Embedding Provider | LLM Provider | DB / Redis |
| :--- | :--- | :--- | :--- |
| **사외 (Dev)** | `OllamaEmbedding` | `Ollama(Llama3)` | Docker (Local) |
| **사내 (Prod)** | `InternalGptEmbedding` | `S-GPT (Internal API)` | On-Premise / S-Net |

### **[Transition Tip]**
`.env` 파일의 `AI_MODE` 변수(예: `dev` vs `prod`)에 따라 `ProviderFactory` 클래스에서 실제 주입될 인스턴스를 결정하도록 구현합니다.

---

## 7. [Infrastructure Rules]
Vector Dimension: 임베딩 모델(Ollama vs 사내 GPT)에 따라 벡터 차원이 달라질 수 있으므로, DIMENSION 환경 변수를 통해 유연하게 관리한다.

Asynchronous Flow:

vsto-fastapi가 DB 적재 성공 시 Redis photo_key_events 채널에 JSON 발행.

FastStream 기반 워커가 이를 수신하여 임베딩 수행.

Migration Strategy:

이미 DB에 적재된 데이터는 별도의 Python 스크립트를 사용하여 embedding 테이블에 없는 photo_key_id를 추출, Redis 큐에 밀어 넣는 방식으로 일괄 처리한다.

## 8. [Design Pattern]
Repository Pattern: DB 접근은 반드시 Repository 레이어를 통하며, 벡터 검색(L2 distance 또는 Cosine Similarity) 로직은 추상화하여 제공한다.



Prisma를 사용하여 모든 스키마를 관리하고 계시므로, `pgvector`를 Prisma 환경에서 안전하게 설정하고 기존 데이터를 실시간 Pub/Sub 흐름에 타게 만드는 **전략적 가이드라인**을 작성해 드립니다.

---

## 1. Prisma Schema 설정 (`pgvector` 대응)

Prisma는 아직 벡터 타입을 기본적으로 지원하지 않으므로, `Unsupported` 타입을 사용하여 SQL 레벨의 `vector` 타입을 정의해야 합니다.

```prisma
// prisma/schema.prisma

// 1. PostgreSQL 확장을 사용하기 위한 설정 (Prisma 4.5.0 이상)
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector] // pgvector 확장 활성화
}

// 2. PhotoKeyEmbedding 모델 생성
model PhotoKeyEmbedding {
  id          Int                      @id @default(autoincrement())
  photoKeyId  Int                      @unique @map("photo_key_id")
  // pgvector의 vector 타입 정의 (차원은 모델에 따라 설정: OpenAI 1536, Llama3 보통 4096 등)
  embedding   Unsupported("vector(1536)")? 
  content     String                   @db.Text // 임베딩된 실제 텍스트 내용
  createdAt   DateTime                 @default(now()) @map("created_at") @db.Timestamptz(6)

  // 관계 설정: PhotoKey가 삭제되면 임베딩도 삭제됨 (Cascade)
  photoKey    PhotoKey @relation(fields: [photoKeyId], references: [id], onDelete: Cascade)

  @@map("photo_key_embeddings")
}

// 3. 기존 PhotoKey 모델에 Relation 추가
model PhotoKey {
  id          Int                 @id @default(autoincrement())
  // ... 기존 필드들
  embedding   PhotoKeyEmbedding?  // 1:1 관계 추가
  
  @@map("photo_keys")
}
```

### **Migration 실행 방법**
1. `npx prisma migrate dev --name add_pgvector` 실행.
2. 만약 `extensions = [vector]` 설정으로 에러가 난다면, 직접 DB에서 `CREATE EXTENSION IF NOT EXISTS vector;`를 실행한 후 진행하세요.

---

## 2. 기존 데이터 적재 전략 (Backfill Strategy)

기존에 이미 DB에 쌓인 데이터는 VSTO의 `save` 이벤트가 발생하지 않으므로 Pub/Sub 채널에 들어오지 않습니다. 이를 해결하기 위해 **"Backfill 스크립트"**를 사용하여 강제로 Pub/Sub 흐름에 태우는 전략을 권장합니다.

### **전략: "Fake Publish" 스크립트**
별도의 Python 스크립트를 작성하여 임베딩이 없는 데이터를 찾아 Redis 큐에 넣어줍니다.

```python
# scripts/backfill_embeddings.py
import asyncio
from redis import Redis
from app.db import session # Postgres 연결용

async def backfill():
    redis = Redis(host='localhost', port=6379, db=0)
    
    # 1. 임베딩 테이블에 존재하지 않는 PhotoKey ID 조회
    # LEFT JOIN을 사용하여 embedding이 null인 ID만 가져옴
    sql = """
        SELECT pk.id FROM photo_keys pk
        LEFT JOIN photo_key_embeddings pke ON pk.id = pke.photo_key_id
        WHERE pke.id IS NULL
    """
    results = session.execute(sql).fetchall()
    
    print(f"Total {len(results)} items found for backfilling.")

    for row in results:
        # 2. Redis 채널에 신규 생성 이벤트와 동일한 포맷으로 발행
        # 이렇게 하면 Embedding Worker는 신규 데이터인지 기존 데이터인지 모른 채 동일하게 처리함
        redis.publish("photo_key.created", {"id": row.id})
        
    print("Backfill message publishing completed.")

if __name__ == "__main__":
    asyncio.run(backfill())
```

---

## 3. Gemini CLI용 통합 가이드라인 (Harness & Rules)

이 파일은 `gemini_cli`에게 전달하여 코드 품질과 구조를 유지하기 위한 **지시서**입니다.

### **[Project: rfgo-embedding-worker]**
* **Skill (Backfill)**: `Backfill` 기술은 기존 DB의 `Gap`을 메우기 위해 `Redis Publish`를 재활용한다.
* **Rule (Consistency)**: 모든 임베딩은 `FastStream` 워커에서만 수행한다. `vsto-fastapi`나 `nestjs`에서 직접 임베딩하지 않는다. (관심사 분리)
* **Rule (Transaction)**: 임베딩 성공 후 DB 저장 시, 원본 `PhotoKey`가 여전히 존재하는지 체크하고 저장한다.

### **[Infrastructure: Redis Pub/Sub]**
* **Topic**: `photo_key.created`
* **Payload**: `{"id": number}`
* **Logic**: 
    1. Worker가 ID 수신
    2. DB에서 `WorkbookData` 로드
    3. JSON 파싱 및 텍스트 정규화
    4. 벡터화 후 `photo_key_embeddings` 테이블에 `INSERT`

---

## 4. 아키텍처 다이어그램 및 흐름



1.  **VSTO (Save)** → `rfgo-vsto-fastapi` → **DB Save** → **Redis Publish**
2.  **Backfill Script** → **Redis Publish** (기존 데이터 처리용)
3.  **Redis Subscribe** → `rfgo-embedding-worker` → **AI API(Ollama/GPT)** → **Vector DB Save**
4.  **React (Query)** → `rfgo-rag-backend` → **Vector Search** → **Response**

이 구조를 적용하면 **데이터 무결성**을 유지하면서도 사내/사외 환경에 유연하게 대응하는 강력한 RAG 시스템을 구축할 수 있습니다. 이제 **Prisma Migrate**를 실행하고 **FastStream 워커 코드**를 작성해 볼까요?

**이 가이드라인을 `GEMINI.md`와 별개로 `RAG_INSTRUCTIONS.md`로 프로젝트 루트에 배치하세요.** AI Agent에게 "이 가이드라인의 Rules와 Skills를 읽고, `faststream`을 사용한 임베딩 워커의 상세 코드를 작성해줘"라고 요청하면, 사내망 환경까지 고려된 고품질의 클린 코드를 얻으실 수 있습니다. 

이제 **임베딩 워커의 상세 비즈니스 로직(JSON 파싱 알고리즘)**부터 코딩을 시작해 드릴까요?