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
├── app/                # 앱 설정 및 전역 환경
│   ├── providers/      # Apollo, Zustand, Router 설정
│   └── routes/         # 메인 라우터 설정 (Main Router) ⭐
├── components/         # 전역 공용 UI (Layout, Sidebar, Button 등)
├── features/           # 도메인별 핵심 기능
│   ├── post/
│   │   ├── api/        # GraphQL Query
│   │   ├── components/ # 기능 전용 UI
│   │   ├── hooks/      # 비즈니스 로직 (usePostList 등)
│   │   └── pages/      # 기능 내 세부 페이지 (PostDetail, PostList 등)
│   └── auth/           # 로그인/가입 기능
├── pages/              # 실제 라우팅 경로와 매핑되는 Entry Points
└── shared/             # 유틸리티, 상수

5. Next Steps for Developer
GraphQL Schema 정의: Request와 Product 간의 1:N 관계 및 KeyDesign 스키마 우선 확정.

Zustand Store 설계: 배치 기능에서 필요한 KeyElement들의 실시간 좌표 상태 구조 정의.

Mailer Service 연동: 사내 SMTP 또는 API 연동을 위한 인프라 인터페이스 작성.

This document serves as the architectural blueprint for RFGo System.


## 6. Web guide
🔄 2. 라우팅 흐름 (Routing Flow)
Main Router: 전체 경로(/, /posts, /auth)를 정의합니다.

Layout Component: 공통 UI(GNB, Footer)와 Outlet을 사용하여 중첩 라우팅을 구현합니다.

Page Component: features/ 폴더 내의 컴포넌트들을 조합하여 하나의 완성된 화면을 구성합니다.

💻 3. 예시 코드 (Routing 포함)
① 메인 라우터 설정
src/app/routes/index.tsx

TypeScript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import PostPage from '@/pages/post/PostPage';
import PostDetailPage from '@/pages/post/PostDetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, // 공통 레이어 (GNB 등)
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'posts',
        children: [
          { index: true, element: <PostPage /> },
          { path: ':id', element: <PostDetailPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
🔄 2. 데이터 흐름 (Data Flow)
API (GraphQL): 서버 데이터의 스키마와 쿼리 정의.

Store (Zustand): 클라이언트 측에서 공유되어야 할 상태 관리.

Hook (Logic): API 데이터와 Store를 결합하여 UI에 필요한 데이터와 함수를 가공 (Flutter의 BLoC/UseCase 역할).

Component (UI): Hook에서 전달받은 상태를 Tailwind로 시각화.

💻 3. 예시 코드 (Post 기능)
① API: GraphQL 쿼리 정의
src/features/post/api/postQueries.ts

TypeScript
import { gql } from '@apollo/client';

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
    }
  }
`;
② Store: 상태 관리 (Zustand)
src/features/post/store/usePostStore.ts

TypeScript
import { create } from 'zustand';

interface PostState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
③ Hook: 비즈니스 로직 (Controller/UseCase)
src/features/post/hooks/usePostList.ts

TypeScript
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../api/postQueries';
import { usePostStore } from '../store/usePostStore';

export const usePostList = () => {
  const { data, loading, error } = useQuery(GET_POSTS);
  const { searchQuery, setSearchQuery } = usePostStore();

  // 비즈니스 로직: 검색어에 따른 필터링
  const filteredPosts = data?.posts.filter((post: any) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    posts: filteredPosts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
  };
};
④ Component: UI 구현 (Tailwind 적용)
src/features/post/components/PostList.tsx

TypeScript
import React from 'react';
import { usePostList } from '../hooks/usePostList';

export const PostList: React.FC = () => {
  const { posts, loading, searchQuery, setSearchQuery } = usePostList();

  if (loading) return <div className="p-4 animate-pulse text-slate-400">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-2xl shadow-xl">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-sky-500 outline-none transition-all"
        placeholder="Search posts..."
      />
      
      <div className="grid gap-4">
        {posts?.map((post: any) => (
          <article key={post.id} className="p-4 bg-slate-800 rounded-xl hover:bg-slate-750 border border-transparent hover:border-sky-500/50 transition-all cursor-pointer">
            <h3 className="text-lg font-semibold text-sky-400">{post.title}</h3>
            <p className="text-slate-400 text-sm mt-1">{post.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
🎯 4. 유지보수 가이드 (Summary)
한 폴더에 한 기능: 특정 기능에 수정사항이 생기면 해당 features/ 폴더 안에서 모든 해결이 가능해야 합니다.

Hook의 추상화: 컴포넌트(tsx) 파일에는 가급적 비즈니스 로직을 쓰지 마세요. useSomething 훅이 데이터를 가져오고 가공하는 책임을 가집니다.

Zustand의 최소화: 서버 데이터(GraphQL)는 Apollo의 캐시를 믿고, Zustand는 오직 전역 UI 상태(모달, 필터 조건, 유저 정보)에만 사용합니다.

Tailwind의 활용: CSS 파일을 별도로 관리하지 말고, 컴포넌트 내부에 스타일을 인라인으로 작성하여 스타일 응집도를 높입니다.


### 💡 추가 팁
Flutter에서 `Navigator.pushNamed(context, '/detail', arguments: id)`를 썼다면, React Router에서는 `const navigate = useNavigate(); navigate(\`/posts/\${id}\`);`와 같은 방식으로 이동합니다. 

이제 이 구조를 바탕으로 실제 프로젝트를 시작해 보세요! 추가로 **API 에러 핸들링**이나 **Loading Skeleton*