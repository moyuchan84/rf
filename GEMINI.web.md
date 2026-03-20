# ?? Project RFGo: Semiconductor Photo-Key Management System
> **Role:** React + NestJS(GraphQL) Architecture & Planning Specialist
> **Objective:** 怨좏뭹吏?Photo-Key ?섎ː, 諛곗튂 諛?RAG 湲곕컲 遺꾩꽍 ?쒖뒪???ㅺ퀎

---

## 1. System Architecture Overview

蹂??쒖뒪?쒖? ?꾨찓??濡쒖쭅??蹂듭옟?깆쓣 ?닿껐?섍린 ?꾪빐 **Hexagonal Architecture(Ports and Adapters)**瑜?吏?ν븯硫? VSTO ?대씪?댁뼵?몄????곗씠???뺥빀?깆쓣 理쒖슦?좎쑝濡??⑸땲??

### ?룛截?rfgo-vsto-fastapi: NestJS (Hexagonal Structure)
- **Domain Layer:** `ProcessPlan`, `Product`, `Request` ???듭떖 鍮꾩쫰?덉뒪 ?뷀떚??諛?濡쒖쭅 (Pure TS).
- **Application Layer:** Use Cases (?섎ː ?뱀씤 ?꾨줈?몄뒪, 硫붿씪 諛쒖넚 濡쒖쭅, RAG 吏덉쓽 flow).
- **Infrastructure Layer:** TypeORM/Prisma (PostgreSQL), GraphQL Resolvers, Mailer Adapter, Vector DB(pgvector).

### ?렓 Frontend: React (Feature-based)
- **Features:** `Request`, `Inventory`, `Layout-Designer`, `RAG-Search`濡??꾨찓?몃퀎 ?묒냽??媛뺥솕.
- **State Management:** - `Zustand`: UI ?곹깭 諛??쒕옒洹????쒕∼ 諛곗튂 ?곗씠??愿由?
  - `TanStack Query`: ?쒕쾭 ?ъ씠??罹먯떛 諛??ㅼ떆媛??곹깭(Status) ?낅뜲?댄듃.
- **UI Framework:** Tailwind CSS + Headless UI (怨좎꽦???곗씠???뚯씠釉?諛???쒕낫??.

---

## 2. Technical Stack & Data Strategy

### ?뱤 Database Schema (Key Entities)
| Category | Entity | Description |
| :--- | :--- | :--- |
| **Master** | `Product` | Meta(Chip/Shot/MTO) ?뺣낫瑜??ы븿???쒗뭹 留덉뒪??|
| **Workflow** | `Request` | ?섎ː?? Status, PDK Version, EDM 留곹겕 愿由?|
| **Work Data** | `KeyTable` | VSTO?먯꽌 ?꾩넚??JSONB ?뺥깭???먮낯 諛?媛怨??곗씠??|
| **Design** | `KeyDesign` | Key ?대쫫, ?ㅻ챸, ?대?吏(Binary/Path) ?뺣낫 |
| **Layout** | `ProductLayout` | Reticle 湲곕컲 諛곗튂 ?뺣낫 (JSON) 諛?寃곌낵 ?대?吏 |

### ?썱截?Key Technologies
- **API:** GraphQL (Code-first) - ?꾨윴?몄뿏?쒖? ?꾧꺽?????怨듭쑀.
- **Vector Search:** `pgvector` + `LangChain` - Key Table ?섏튂 ?곗씠?곗쓽 ?쒕㎤??寃??
- **Real-time:** `Socket.io` - ?섎ː ?곹깭 蹂寃????대떦???ㅼ떆媛??뚮┝.

---

## 3. Implementation Roadmap & Design Patterns

### Step 1: ?섎ː 諛??뱀씤 ?뚰겕?뚮줈??(Status Management)
- **Pattern:** `State Pattern`???ъ슜?섏뿬 `Draft -> Requested -> Approved -> In Progress -> Verified` ?곹깭 ?꾩씠瑜?愿由ы빀?덈떎.
- **Implementation:** NestJS??`Guard`瑜??듯빐 ??븷蹂?RFG, Inno, Admin) ?묎렐 沅뚰븳???쒖뼱?⑸땲??

### Step 2: VSTO ?곗씠???곕룞 諛?鍮꾧탳 (Data Analytics)
- **Pattern:** `Strategy Pattern`???쒖슜?섏뿬 Version蹂? Product蹂??곗씠??鍮꾧탳 ?뚭퀬由ъ쬁???좎뿰?섍쾶 援먯껜 媛?ν븯?꾨줉 ?ㅺ퀎?⑸땲??
- **Feature:** `JSONB_DIFF` 湲곕뒫???쒕쾭痢≪뿉???섑뻾?섏뿬 蹂寃쎈맂 Cell留??섏씠?쇱씠?명븯??湲곕뒫??React Table??援ы쁽?⑸땲??

### Step 3: Photo Key Layout 諛곗튂 (Canvas/SVG)
- **Library:** `react-konva` ?먮뒗 `SVG` 湲곕컲 ?명꽣?섏씠??
- **Feature:** ?대┰蹂대뱶 ?대?吏(Reticle)瑜?諛곌꼍?쇰줈 ?ㅼ젙?섍퀬, Key ?붿냼瑜??덉씠?대줈 愿由ы븯??醫뚰몴媛?`json`)??異붿텧?⑸땲??

### Step 4: RAG (Retrieval-Augmented Generation)
- **Flow:** 1. PostgreSQL??Key Table ?곗씠?곕? ?띿뒪??泥?겕??
  2. OpenAI ?먮뒗 ?щ궡 LLM ?꾨쿋??紐⑤뜽???듯빐 踰≫꽣????`pgvector` ???
  3. ?ъ슜??吏덉쓽 ???좎궗??寃?됱쓣 ?듯빐 愿??Table ?꾩텧 諛??듬? ?앹꽦.

---

## 4. Proposed Folder Structure

### rfgo-vsto-fastapi (NestJS)
```text
src/
?쒋?? modules/
??  ?쒋?? auth/
??  ?쒋?? request/ (?섎ː ?꾨찓??
??  ??  ?쒋?? domain/ (Entities)
??  ??  ?쒋?? application/ (Services, Use Cases)
??  ??  ?쒋?? infrastructure/ (Repositories, Mailer)
??  ??  ?붴?? interface/ (Resolvers, DTOs)
??  ?쒋?? key-design/
??  ?붴?? rag/
?붴?? common/ (Middlewares, Interceptors, Decorators)

### Frontend (React)
src/
?쒋?? app/                # ???ㅼ젙 諛??꾩뿭 ?섍꼍
??  ?쒋?? providers/      # Apollo, Zustand, Router ?ㅼ젙
??  ?붴?? routes/         # 硫붿씤 ?쇱슦???ㅼ젙 (Main Router) 狩?
?쒋?? components/         # ?꾩뿭 怨듭슜 UI (Layout, Sidebar, Button ??
?쒋?? features/           # ?꾨찓?몃퀎 ?듭떖 湲곕뒫
??  ?쒋?? post/
??  ??  ?쒋?? api/        # GraphQL Query
??  ??  ?쒋?? components/ # 湲곕뒫 ?꾩슜 UI
??  ??  ?쒋?? hooks/      # 鍮꾩쫰?덉뒪 濡쒖쭅 (usePostList ??
??  ??  ?붴?? pages/      # 湲곕뒫 ???몃? ?섏씠吏 (PostDetail, PostList ??
??  ?붴?? auth/           # 濡쒓렇??媛??湲곕뒫
?쒋?? pages/              # ?ㅼ젣 ?쇱슦??寃쎈줈? 留ㅽ븨?섎뒗 Entry Points
?붴?? shared/             # ?좏떥由ы떚, ?곸닔

5. Next Steps for Developer
GraphQL Schema ?뺤쓽: Request? Product 媛꾩쓽 1:N 愿怨?諛?KeyDesign ?ㅽ궎留??곗꽑 ?뺤젙.

Zustand Store ?ㅺ퀎: 諛곗튂 湲곕뒫?먯꽌 ?꾩슂??KeyElement?ㅼ쓽 ?ㅼ떆媛?醫뚰몴 ?곹깭 援ъ“ ?뺤쓽.

Mailer Service ?곕룞: ?щ궡 SMTP ?먮뒗 API ?곕룞???꾪븳 ?명봽???명꽣?섏씠???묒꽦.

This document serves as the architectural blueprint for RFGo System.


## 6. Web guide
?봽 2. ?쇱슦???먮쫫 (Routing Flow)
Main Router: ?꾩껜 寃쎈줈(/, /posts, /auth)瑜??뺤쓽?⑸땲??

Layout Component: 怨듯넻 UI(GNB, Footer)? Outlet???ъ슜?섏뿬 以묒꺽 ?쇱슦?낆쓣 援ы쁽?⑸땲??

Page Component: features/ ?대뜑 ?댁쓽 而댄룷?뚰듃?ㅼ쓣 議고빀?섏뿬 ?섎굹???꾩꽦???붾㈃??援ъ꽦?⑸땲??

?뮲 3. ?덉떆 肄붾뱶 (Routing ?ы븿)
??硫붿씤 ?쇱슦???ㅼ젙
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
    element: <RootLayout />, // 怨듯넻 ?덉씠??(GNB ??
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
?봽 2. ?곗씠???먮쫫 (Data Flow)
API (GraphQL): ?쒕쾭 ?곗씠?곗쓽 ?ㅽ궎留덉? 荑쇰━ ?뺤쓽.

Store (Zustand): ?대씪?댁뼵??痢≪뿉??怨듭쑀?섏뼱?????곹깭 愿由?

Hook (Logic): API ?곗씠?곗? Store瑜?寃고빀?섏뿬 UI???꾩슂???곗씠?곗? ?⑥닔瑜?媛怨?(Flutter??BLoC/UseCase ??븷).

Component (UI): Hook?먯꽌 ?꾨떖諛쏆? ?곹깭瑜?Tailwind濡??쒓컖??

?뮲 3. ?덉떆 肄붾뱶 (Post 湲곕뒫)
??API: GraphQL 荑쇰━ ?뺤쓽
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
??Store: ?곹깭 愿由?(Zustand)
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
??Hook: 鍮꾩쫰?덉뒪 濡쒖쭅 (Controller/UseCase)
src/features/post/hooks/usePostList.ts

TypeScript
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../api/postQueries';
import { usePostStore } from '../store/usePostStore';

export const usePostList = () => {
  const { data, loading, error } = useQuery(GET_POSTS);
  const { searchQuery, setSearchQuery } = usePostStore();

  // 鍮꾩쫰?덉뒪 濡쒖쭅: 寃?됱뼱???곕Ⅸ ?꾪꽣留?
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
??Component: UI 援ы쁽 (Tailwind ?곸슜)
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
?렞 4. ?좎?蹂댁닔 媛?대뱶 (Summary)
???대뜑????湲곕뒫: ?뱀젙 湲곕뒫???섏젙?ы빆???앷린硫??대떦 features/ ?대뜑 ?덉뿉??紐⑤뱺 ?닿껐??媛?ν빐???⑸땲??

Hook??異붿긽?? 而댄룷?뚰듃(tsx) ?뚯씪?먮뒗 媛湲됱쟻 鍮꾩쫰?덉뒪 濡쒖쭅???곗? 留덉꽭?? useSomething ?낆씠 ?곗씠?곕? 媛?몄삤怨?媛怨듯븯??梨낆엫??媛吏묐땲??

Zustand??理쒖냼?? ?쒕쾭 ?곗씠??GraphQL)??Apollo??罹먯떆瑜?誘욧퀬, Zustand???ㅼ쭅 ?꾩뿭 UI ?곹깭(紐⑤떖, ?꾪꽣 議곌굔, ?좎? ?뺣낫)?먮쭔 ?ъ슜?⑸땲??

Tailwind???쒖슜: CSS ?뚯씪??蹂꾨룄濡?愿由ы븯吏 留먭퀬, 而댄룷?뚰듃 ?대????ㅽ??쇱쓣 ?몃씪?몄쑝濡??묒꽦?섏뿬 ?ㅽ????묒쭛?꾨? ?믪엯?덈떎.


### ?뮕 異붽? ??
Flutter?먯꽌 `Navigator.pushNamed(context, '/detail', arguments: id)`瑜??쇰떎硫? React Router?먯꽌??`const navigate = useNavigate(); navigate(\`/posts/\${id}\`);`? 媛숈? 諛⑹떇?쇰줈 ?대룞?⑸땲?? 

?댁젣 ??援ъ“瑜?諛뷀깢?쇰줈 ?ㅼ젣 ?꾨줈?앺듃瑜??쒖옉??蹂댁꽭?? 異붽?濡?**API ?먮윭 ?몃뱾留?*?대굹 **Loading Skeleton*

[frontend ?먯꽌 graphql ???곗씠?곕룞湲고솕??諛섎뱶??]GraphQL Code Generator
GraphQL ??낆쓣 ?먮룞?쇰줈 ?숆린?뷀븯??媛???쒖??곸씤 諛⑸쾿? GraphQL Code Generator瑜??ъ슜?섎뒗 寃껋엯?덈떎.
