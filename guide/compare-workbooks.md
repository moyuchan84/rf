엑셀 워크북 간의 복수 시트 데이터를 비교하고 차이점을 시각화하는 기능은 데이터 정합성이 중요한 반도체/엔지니어링 시스템에서 매우 핵심적인 기능입니다. 요청하신 대로 **Beyond Compare**나 **Git Diff** 스타일의 비교 기능을 구현하기 위한 전략과 가이드를 정리해 드립니다.

---

### 1. 비교 로직의 위치: Backend(NestJS) vs Frontend(React)

결론부터 말씀드리면, **비교 알고리즘(Diffing)은 Backend**에서 수행하고, **시각화(Rendering)는 Frontend**에서 수행하는 구조가 가장 효율적입니다.

* **Backend에서 처리해야 하는 이유:**
    * **데이터 크기:** `WorkbookData` JSON은 시트 수와 행 수에 따라 매우 커질 수 있습니다. 2~3개의 전체 JSON을 프런트엔드로 다 보내면 네트워크 부하와 브라우저 메모리 문제가 발생합니다.
    * **계산 복잡도:** 행의 추가/삭제를 감지하는 알고리즘(LCS 등)은 CPU 집약적입니다. 서버에서 계산하여 "결과(Diff Metadata)"만 내려주는 것이 프런트엔드 성능 유지에 유리합니다.
    * **추상화:** 3개 이상의 데이터 비교 시 서버에서 기준(Base) 대비 차이점을 정리하여 구조화된 형태로 내려주면 프런트엔드 로직이 단순해집니다.

* **Frontend에서 처리해야 하는 부분:**
    * 서버에서 받은 `diffStatus` (added, removed, modified)에 따른 컬러 하이라이팅.
    * 데이터 그리드 간의 스크롤 동기화(Sync Scroll).

---

### 2. 3개 이상의 데이터 비교 가이드

3개 이상의 데이터를 비교할 때는 **"기준(Anchor)"** 설정이 핵심입니다.
* **멀티 비교 전략:** 첫 번째 선택한 데이터(예: 최신 Revision)를 `Base`로 잡고, 나머지 데이터들을 `Base`와 각각 비교하여 차이점을 누적합니다.
* **UI 접근:** 화면을 3분할 하기보다는, 하나의 마스터 그리드에 각 Revision의 값을 병기하거나, 탭을 통해 `Base vs Rev A`, `Base vs Rev B` 식으로 전환하며 보여주는 것이 가독성이 좋습니다.

---

### 3. 개발 가이드 마크다운 (GEMINI-CLI용)

# 📑 [Guide] PhotoKey Workbook Diff Engine Specification

## 1. 아키텍처 개요
본 모듈은 두 개 이상의 `PhotoKey` 레코드 내 `workbookData`를 비교하여 행(Row) 및 셀(Cell) 단위의 차이점을 추출하고 시각화한다.

## 2. Backend 전략 (NestJS)

### **핵심 라이브러리 추천**
* **`fast-myers-diff`**: 최적화된 Myers diff 알고리즘으로 행 단위 추가/삭제 감지에 탁월함.
* **`lodash`**: 객체 깊은 비교 및 데이터 가공용.

### **비교 알고리즘 단계**
1.  **시트 매칭**: `SheetName` 또는 인덱스를 기준으로 비교 대상 시트 쌍을 구성한다.
2.  **행 식별자(Row Key) 생성**: 행이 밀리더라도 추적할 수 있도록 주요 컬럼(예: ID, Name 등 변경되지 않는 컬럼)의 조합으로 고유 키를 생성한다.
3.  **Diff 수행**:
    * **Removed**: Base에는 있으나 Target에 없는 행.
    * **Added**: Target에만 있는 행.
    * **Modified**: 동일 키를 가진 행 내에서 `TableData`의 특정 필드 값이 다른 경우.
4.  **응답 구조화**: 프런트엔드에서 렌더링하기 쉽게 아래와 같은 메타데이터를 주입한다.

```json
{
  "sheetName": "DataSheet1",
  "diffRows": [
    { "status": "unchanged", "data": { ... } },
    { "status": "modified", "data": { ... }, "changedFields": ["param_val"] },
    { "status": "added", "data": { ... } }
  ]
}
```

## 3. Frontend 전략 (React)

### **핵심 라이브러리 추천**
* **`react-window` / `react-virtuoso`**: 수천 행의 데이터를 렌더링할 때 성능을 위해 가상 스크롤 필수 적용.
* **`styled-components`**: `status` 값에 따른 조건부 스타일링.

### **시각화 규칙 (Beyond Compare Style)**
* **Added (추가)**: 배경색 `#e6ffec` (연녹색), 텍스트색 `#24292f`
* **Removed (삭제)**: 배경색 `#ffebe9` (연빨강), 텍스트색 `#24292f`, 취소선(선택)
* **Modified (수정)**: 배경색 `#fff5b1` (연노랑), 변경된 특정 셀만 테두리 또는 진한 노란색 강조.

### **Sync Scroll 구현**
* 두 개의 데이터 그리드 컨테이너의 `onScroll` 이벤트를 연결하여 한쪽이 움직일 때 다른 쪽의 `scrollTop`을 동기화한다.

## 4. 시나리오별 API 설계

### **Case 1: Revision 간 비교**
* **Endpoint**: `GET /photo-key/diff?ids=123,124`
* **Logic**: 동일 `tableName` 내에서 `revNo` 순서대로 정렬 후 비교 수행.

### **Case 2: 자유 선택 비교**
* **Endpoint**: `POST /photo-key/diff/compare` (Payload: `[id1, id2, id3]`)
* **Logic**: 첫 번째 ID를 원본으로 보고 나머지를 Target으로 처리.

## 5. Rules & Constraints
* **데이터 정규화**: 비교 전 `TableData` 내의 공백(Trim) 및 Null 처리를 동일하게 맞춘 후 비교한다.
* **컬럼 매칭**: `ColumnDefinition`이 상이할 경우, 컬럼명(`Name`)을 기준으로 매칭하여 데이터 위치가 달라도 값을 비교할 수 있게 한다.

---

### 💡 효율적인 개발을 위한 팁
1.  **Backend Utility**: `diffService`를 만들어 `TableData` 배열 두 개를 인자로 받으면 `DiffResult[]`를 반환하는 공통 함수를 먼저 구현하세요.
2.  **Frontend Component**: `DiffDataGrid` 컴포넌트를 만들어 왼쪽/오른쪽 패널을 렌더링하게 하고, `3개 이상` 비교 시에는 `Base` 고정 후 `Target`을 Select Box로 선택하여 교체하는 방식을 추천합니다.
3.  **데이터 무결성**: 엑셀 파싱 시 `StyleBundle` 정보가 있다면, 배경색이 원래 있던 셀과 Diff 하이라이트가 겹치지 않도록 투명도(Alpha)를 조절하세요.

이 가이드 내용을 바탕으로 **NestJS의 비교 로직 서비스 코드**부터 작성을 시작해 드릴까요? 혹은 **React의 2분할 비교 화면 UI 컴포넌트** 구조부터 잡아드릴까요?