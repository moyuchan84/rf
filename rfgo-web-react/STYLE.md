# Frontend Style Guide - Semiconductor Photo-Key Management System

본 문서는 프로젝트의 일관된 UI/UX 유지를 위한 표준 스타일 가이드를 정의합니다. 모든 신규 컴포넌트 및 페이지 작성 시 아래의 기준을 준수해야 합니다.

## 1. 전역 레이아웃 (Layout)
기존의 광활한 배치를 지양하고, 고밀도의 데이터 처리가 가능한 컴팩트한 스케일을 지향합니다.

| 구분 | Tailwind Class | 비고 |
| :--- | :--- | :--- |
| **Header Height** | `h-16` | 기존 h-24에서 축소 |
| **Sidebar Width** | `w-60` | 기존 w-72에서 축소 |
| **Main Padding** | `p-6` | RootLayout 내 Content 영역 |
| **Max Content Width** | `max-w-[1600px]` | 대화면 대응 중앙 정렬 |

## 2. 타이포그래피 (Typography)
페이지 제목과 설명의 스타일을 통일하여 시각적 위계 질서를 유지합니다.

| 위계 | Tailwind Class | 용도 |
| :--- | :--- | :--- |
| **Page Title** | `text-2xl font-black` | 페이지 최상단 메인 제목 |
| **Description** | `text-[10px] uppercase tracking-widest` | 제목 하단 보조 설명 |
| **Section Title** | `text-lg font-black` | 카드 또는 섹션 내 제목 |
| **Card Header** | `text-xs font-black uppercase` | 작은 컴포넌트 헤더 |
| **Body Text** | `text-sm` 또는 `text-xs` | 일반 텍스트 및 데이터 |
| **Labels/Metas** | `text-[8px]` 또는 `text-[9px]` | 초소형 메타 정보, 칩 내부 텍스트 |

## 3. 공통 컴포넌트 스타일 (Component Standards)

### 3.1 라운드 처리 (Border Radius)
Enterprise 소프트웨어의 전문성을 위해 과도한 곡률을 지양하고 정제된 스타일을 사용합니다.
*   **표준 카드/컨테이너**: `rounded-md` (기존 rounded-2xl/3xl에서 변경)
*   **입력창/버튼**: `rounded-md`
*   **특수 칩/태그**: `rounded-sm`

### 3.2 그림자 및 테두리 (Shadow & Border)
*   **Border**: `border-slate-200/60` (Light), `border-slate-800` (Dark)
*   **Shadow**: `shadow-sm` (Light), `shadow-xl` (Dark)
*   **Hover State**: 테두리 강조 (`hover:border-indigo-500/50`) 및 배경 미세 변화

## 4. 컬러 시스템 (Theme System)
`dark` 클래스를 기반으로 Light/Dark 모드를 완벽히 대응합니다.

| 요소 | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| **Background (Base)** | `bg-slate-50` | `bg-slate-950` |
| **Card/Panel** | `bg-white` | `bg-slate-900/50` |
| **Text (Primary)** | `text-slate-900` | `text-white` |
| **Text (Secondary)** | `text-slate-500` | `text-slate-400` |
| **Input Background** | `bg-slate-50` | `bg-slate-950` |
| **Accent (Primary)** | `indigo-600` | `indigo-500` |

## 5. 데이터 밀도 가이드 (Density)
사용자가 한 화면에서 더 많은 정보를 볼 수 있도록 모든 요소를 기존 대비 **80% 스케일**로 유지합니다.
*   **Padding**: 큰 공간은 `p-10` -> `p-6` 또는 `p-8`로, 작은 공간은 `p-4` -> `p-3` 수준으로 조정.
*   **Icon Scale**: 기본 아이콘 크기는 `w-4 h-4` 또는 `w-5 h-5`를 주로 사용.
*   **Spacing**: `gap-8` -> `gap-6`, `space-y-8` -> `space-y-6` 수준으로 긴밀하게 배치.

## 6. 애니메이션 (Motion)
페이지 및 컴포넌트 전환 시 부드러운 진입 효과를 사용합니다.
*   `animate-in fade-in slide-in-from-bottom-4 duration-700`
*   버튼 클릭 시: `active:scale-95 transition-all`

---
*Last Updated: 2026-03-17*
