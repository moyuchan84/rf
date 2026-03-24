제시해주신 요구사항과 프로젝트 가이드를 결합하여, **RFGo 시스템의 핵심 워크플로우(Request → Reference 확인 → VSTO 작업)**를 구현하기 위한 `GEMINI-CLI` 전용 마크다운 스크립트를 작성했습니다.

이 스크립트는 **FastAPI(백엔드)**의 Clean Architecture 적용과 **VSTO(클라이언트)**의 WebView2 제어 로직을 동기화하는 데 초점을 맞추고 있습니다.

---

# 🚀 Implementation Request: Request-to-VSTO Setup Workflow

## 1. Context & Objectives
사용자가 Web Portal에서 특정 `ProcessPlan-BEOL-Product`를 선택하여 의뢰(Request) 목록을 확인하고, 상세 페이지(`RequestDetails`)에서 **Reference Table**을 선택하여 VSTO(`RFGo.PhotoKey.Manager`)로 데이터를 로드 및 엑셀로 내려받는 **RequestSetupProcess** 전 과정을 구현합니다.

---

## 2. Backend Strategy (FastAPI - Clean Architecture)
**파일 경로:** `@endpoints/photo_keys.py` 및 도메인 레이어

### 2.1 Domain & Schema
- **Request Inquiry**: `updatedAt` 역순으로 `RequestItem` 목록 반환 API.
- **Reference Resolution**: 특정 `Request` ID에 연결된 `RequestTableMap`에서 `type='REFERENCE'`인 `PhotoKey` 목록 추출.
- **Data Streaming**: 선택된 `PhotoKey`의 `JSONB` 데이터를 VSTO로 전송하거나 엑셀 파일 생성을 위한 데이터 가공.

### 2.2 Endpoint Requirements
- `GET /requests/{product_id}`: 제품별 의뢰 목록 조회 (정렬: `updatedAt DESC`).
- `GET /requests/{request_id}/references`: 의뢰별 참조 테이블(PhotoKeys) 목록 조회.
- `GET /photo-keys/{id}/download`: 특정 테이블의 스타일 데이터를 포함한 원문 데이터 제공.

---

## 3. VSTO Client Strategy (WebView2 + Vue 3)
**가이드 준수:** `No-Build Architecture` (CDN 기반 Vue 3 + Tailwind CSS)

### 3.1 UI 구현 (`Resources/WebView/index.html`)
- **Request Navigator**: 좌측 사이드바에서 제품 계층 구조 선택 시 의뢰 목록 렌더링.
- **Reference Selector**: 의뢰 상세 페이지 내에서 `REFERENCE` 타입의 테이블들을 체크박스/리스트 형태로 노출.
- **Action Toolbar**: 'VSTO로 로드', '엑셀 다운로드' 버튼 배치.

### 3.2 Logic 구현 (`Resources/WebView/app.js`)
- **C# Bridge 호출**: `window.chrome.webview.hostObjects.bridge`를 통해 다음 기능 실행.
    - `bridge.LoadReferenceToExcel(jsonData)`: 선택된 JSON 데이터를 엑셀 시트에 쓰기.
    - `bridge.DownloadAsExcel(targetFolder)`: 특정 폴더를 선택하고 데이터를 엑셀 파일로 저장.
- **FastAPI 연동**: `fetch` API를 사용하여 백엔드에서 의뢰 및 참조 데이터를 비동기 로드.

---

## 4. 상세 작업 명세 (Step-by-Step)

### Step 1: Request List & Details (Web/React 로직 이관)
- `processplan-beoloption-product` 필터를 통해 검색된 `RequestItem`들을 카드/테이블 뷰로 표시.
- 클릭 시 `@RequestDetails.tsx` 스펙에 따라 상세 정보 및 관련 `Reference Table` 로드.

### Step 2: RequestSetupProcess (VSTO 연동)
- VSTO 내부 WebView2에서 선택된 Reference 정보를 C# 비즈니스 로직으로 전달.
- **폴더 선택 기능**: C# `FolderBrowserDialog`를 호출하여 로컬 경로를 획득하고 `ExcelJS` 또는 VSTO 내장 라이브러리를 통해 파일 생성.

### Step 3: 데이터 정합성 유지
- `photo_keys` 테이블의 `workbook_data` 및 `style_bundle`을 활용하여 엑셀 복원 시 원본 스타일(배경색, 테두리 등) 유지.

---

## 5. GEMINI-CLI 요청 스크립트 (Copy & Paste)

```markdown
# [RFGo System] RequestSetupProcess & VSTO Integration Request

## 1. FastAPI (Backend)
- Implement `GET /requests` with product hierarchy filters, sorted by `updatedAt` DESC.
- Implement `GET /requests/{request_id}/reference-tables` to fetch PhotoKeys linked via `RequestTableMap` where type is 'REFERENCE'.
- Follow Clean Architecture: Separate Repository (SQLAlchemy) and Service layers.

## 2. VSTO WebView2 (Frontend)
- Create `index.html` using Tailwind CSS (Play CDN) and Vue 3 (Global Build).
- Layout: Sidebar for Product Selection -> Main Content for Request List -> Request Details with Reference Table Checkboxes.
- Implement `app.js` to handle:
  - API calls to FastAPI for fetching request items.
  - Interaction with `window.chrome.webview.hostObjects.bridge`.
  - Integration of Folder Selection and Excel Download triggers as defined in `DataInquiry` logic.

## 3. C# (VSTO Add-in)
- Define `IBridge` interface with `LoadReferenceToExcel` and `DownloadFile` methods.
- Implement `Smart Anchor Detection` and `Cell Style Persistence` when writing data back to Excel from the JSONB payload.

## 4. Ground Rules
- No-build (Use CDNs for Vue/Tailwind).
- Professional Slate/Blue Dashboard Theme.
- High-performance data rendering for large key tables.
```

---

### **💡 전문가의 팁 (Implementation Tip)**
1. **정렬 성능**: 의뢰 목록이 많아질 것에 대비하여 `updatedAt` 인덱스를 DB에 생성하고 페이징 처리를 고려하세요.
2. **VSTO Bridge 보안**: `bridge` 객체를 통해 노출되는 C# 메서드는 반드시 필요한 기능으로 한정하고, 데이터 유효성 검사를 거쳐야 합니다.
3. **스타일 복원**: `style_bundle`에 담긴 Base64 데이터를 엑셀의 `Range.Interior.Color` 등으로 변환할 때 성능 저하가 발생할 수 있으므로, 대량 데이터의 경우 `Excel Object Model` 대신 `OpenXML` 라이브러리 사용을 검토해 보세요.

**위 스크립트를 `GEMINI.md`에 추가하여 개발을 진행할까요?** 혹은 특정 API 엔드포인트의 상세 로직을 먼저 작성해 드릴까요?