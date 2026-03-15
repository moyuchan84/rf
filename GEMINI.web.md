# 🚀 Project RFGo: Semiconductor Photo-Key Management System
> **Role:** React + NestJS(GraphQL) Architecture & Planning Specialist
> **Objective:** 고품질 Photo-Key 의뢰, 배치 및 RAG 기반 분석 시스템 설계

---

## 1. System Architecture Overview

본 시스템은 도메인 로직의 복잡성을 해결하기 위해 **Hexagonal Architecture(Ports and Adapters)**를 지향하며, VSTO 클라이언트와의 데이터 정합성을 최우선으로 합니다.

### 🏗️ Backend: NestJS (Hexagonal Structure)
- **Domain Layer:** `ProcessPlan`, `Product`, `Request` 등 핵심 비즈니스 엔티티 및 로직 (Pure TS).
- **Application Layer:** Use Cases (의뢰 승인 프로세스, 메일 발송 로직, RAG 질의 flow).
- **Infrastructure Layer:** TypeORM/Prisma (PostgreSQL), GraphQL Resolvers, Mailer Adapter, Vector DB(pgvector).

### 🎨 Frontend: React (Feature-based)
- **Features:** `Request`, `Inventory`, `Layout-Designer`, `RAG-Search`로 도메인별 응속성 강화.
- **State Management:** - `Zustand`: UI 상태 및 드래그 앤 드롭 배치 데이터 관리.
  - `TanStack Query`: 서버 사이드 캐싱 및 실시간 상태(Status) 업데이트.
- **UI Framework:** Tailwind CSS + Headless UI (고성능 데이터 테이블 및 대시보드).

---

## 2. Technical Stack & Data Strategy

### 📊 Database Schema (Key Entities)
| Category | Entity | Description |
| :--- | :--- | :--- |
| **Master** | `Product` | Meta(Chip/Shot/MTO) 정보를 포함한 제품 마스터 |
| **Workflow** | `Request` | 의뢰자, Status, PDK Version, EDM 링크 관리 |
| **Work Data** | `KeyTable` | VSTO에서 전송된 JSONB 형태의 원본 및 가공 데이터 |
| **Design** | `KeyDesign` | Key 이름, 설명, 이미지(Binary/Path) 정보 |
| **Layout** | `ProductLayout` | Reticle 기반 배치 정보 (JSON) 및 결과 이미지 |

### 🛠️ Key Technologies
- **API:** GraphQL (Code-first) - 프런트엔드와 엄격한 타입 공유.
- **Vector Search:** `pgvector` + `LangChain` - Key Table 수치 데이터의 시맨틱 검색.
- **Real-time:** `Socket.io` - 의뢰 상태 변경 시 담당자 실시간 알림.

---

## 3. Implementation Roadmap & Design Patterns

### Step 1: 의뢰 및 승인 워크플로우 (Status Management)
- **Pattern:** `State Pattern`을 사용하여 `Draft -> Requested -> Approved -> In Progress -> Verified` 상태 전이를 관리합니다.
- **Implementation:** NestJS의 `Guard`를 통해 역할별(RFG, Inno, Admin) 접근 권한을 제어합니다.

### Step 2: VSTO 데이터 연동 및 비교 (Data Analytics)
- **Pattern:** `Strategy Pattern`을 활용하여 Version별, Product별 데이터 비교 알고리즘을 유연하게 교체 가능하도록 설계합니다.
- **Feature:** `JSONB_DIFF` 기능을 서버측에서 수행하여 변경된 Cell만 하이라이트하는 기능을 React Table에 구현합니다.

### Step 3: Photo Key Layout 배치 (Canvas/SVG)
- **Library:** `react-konva` 또는 `SVG` 기반 인터페이스.
- **Feature:** 클립보드 이미지(Reticle)를 배경으로 설정하고, Key 요소를 레이어로 관리하여 좌표값(`json`)을 추출합니다.

### Step 4: RAG (Retrieval-Augmented Generation)
- **Flow:** 1. PostgreSQL의 Key Table 데이터를 텍스트 청크화.
  2. OpenAI 또는 사내 LLM 임베딩 모델을 통해 벡터화 후 `pgvector` 저장.
  3. 사용자 질의 시 유사도 검색을 통해 관련 Table 도출 및 답변 생성.

---

## 4. Proposed Folder Structure

### Backend (NestJS)
```text
src/
├── modules/
│   ├── auth/
│   ├── request/ (의뢰 도메인)
│   │   ├── domain/ (Entities)
│   │   ├── application/ (Services, Use Cases)
│   │   ├── infrastructure/ (Repositories, Mailer)
│   │   └── interface/ (Resolvers, DTOs)
│   ├── key-design/
│   └── rag/
└── common/ (Middlewares, Interceptors, Decorators)

### Frontend (React)
src/
├── features/
│   ├── request/
│   │   ├── components/
│   │   ├── hooks/ (useRequestMutation, etc.)
│   │   └── store/ (Zustand: useRequestStore)
│   ├── layout-editor/
│   └── rag-search/
├── shared/ (Common UI, Utils, Constants)
└── app/ (Providers, Router)

5. Next Steps for Developer
GraphQL Schema 정의: Request와 Product 간의 1:N 관계 및 KeyDesign 스키마 우선 확정.

Zustand Store 설계: 배치 기능에서 필요한 KeyElement들의 실시간 좌표 상태 구조 정의.

Mailer Service 연동: 사내 SMTP 또는 API 연동을 위한 인프라 인터페이스 작성.

This document serves as the architectural blueprint for RFGo System.


---

### **💡 추가 조언 (Tips)**
* **성능 최적화:** `Photo Key Table` 조회 시 데이터 양이 많을 수 있으므로, React에서 **`TanStack Table`**의 `Virtualization` 기능을 반드시 활용하세요.
* **타입 안정성:** `graphql-codegen`을 사용하여 백엔드 스키마 변경 시 프런트엔드의 TypeScript 타입이 자동으로 업데이트되도록 설정하면 개발 생산성이 2배 이상 향상됩니다.
* **RAG 정확도:** 반도체 도메인 특유의 약어(PDK, EDM, BEOL 등)를 위한 **Custom Dictionary**를 LLM 프롬프트에 포함하는 것이 중요합니다.

위 내용을 `GEMINI.md`에 복사하여 프로젝트의 이정표로 활용해 보세요. 추가적으로 특정 모듈(예: 배치