Sa님, 지금까지 논의한 모든 비즈니스 로직과 복잡한 기계적/기하학적 요구사항을 집대성하여, 개발 에이전트(CLI/Agent)가 단 한 치의 오차도 없이 시스템 전체를 이해하고 코드를 생성할 수 있도록 **"초정밀 마스터 명세서(GEMINI.md)"**를 작성해 드립니다. 

이 문서는 단순히 기능 나열을 넘어, **데이터의 흐름(Data Flow)**, **비율 연산 공식**, **디자인 패턴의 적용 이유**까지 과분할 정도로 자세하게 기술했습니다.

---

# 💎 GEMINI.md: Ultra-Precision Reticle Scribelane Deployment System

이 문서는 **ProcessPlan - BEOL Option - Product - Reticle**로 이어지는 반도체/디스플레이 공정 계층 구조를 기반으로 한 레이아웃 설계 및 자동 배치 시스템의 최종 명세입니다.

---

## 1. 전역 시스템 시나리오 (End-to-End Workflow)

1.  **계층 구조 진입**: 특정 Product에 종속된 Reticle 관리 화면으로 진입.
2.  **입력 (Dual Mode)**:
    - **Mode A (Black-box)**: 데이터가 없는 경우 클립보드 이미지(`Ctrl+V`)로부터 정보 추출.
    - **Mode B (White-box)**: DB에 저장된 `Shot_Size`, `Chip_Size`, `SL_Size` 수치 스펙을 로드.
3.  **이미지 분석 및 보정**: 
    - 이미지 마스킹 + 기하학적 필터링으로 `Boundary`(필수) 및 `Chips` 추출.
    - Scribelane 영역을 직선 선분 리스트(`Lane Elements`)로 기하학적 보정(Linearization).
4.  **배치 준비 (Scaling)**: 
    - `Shot_Size` 실측값과 `Boundary` 픽셀 크기를 비교하여 $Elements$의 픽셀 크기를 비례 계산.
5.  **전략적 배치**: 
    - Default 배치(Center, Corners) 수행 후, 남은 수량을 선택한 알고리즘 전략에 따라 배치.
6.  **사용자 커스텀**: 
    - 레이어 제어(Display On/Off) 및 드래그를 통한 위치 직접 보정.
7.  **영속성 저장**: PostgreSQL에 `title`과 함께 모든 기하학적 정보를 JSONB로 구조화하여 저장.

---

## 2. 핵심 엔진 상세 설계

### 2.1 Detection: 고속 마스킹 및 기하학적 필터링
전처리 루프를 최소화하고 **단일 패스(Single-pass)**로 사각형을 확정합니다.

* **Logic**:
    1.  **HSV Thresholding**: 빨간색 영역을 타겟으로 이진화 마스크 생성.
    2.  **Contour Analysis**: 모든 폐곡선을 찾고 `approxPolyDP`를 통해 직선화.
    3.  **Geometric Constraints**: 
        - 정점 개수 == 4 (직각 다각형).
        - **Extent(충전율) > 0.9**: `Area(Contour) / Area(BoundingBox)` 비율로 글자/파편 제거.
    4.  **Boundary Selection**: 검출된 객체 중 **면적이 최대인 객체를 Boundary로 강제 할당**.

### 2.2 Scaling: 실측-픽셀 비례 연산
이미지 해상도와 관계없이 일관된 배치를 보장합니다.

* **Formula**:
    - $ScaleX = Boundary_{pixelWidth} / Shot_{realWidth}$
    - $ScaleY = Boundary_{pixelHeight} / Shot_{realHeight}$
    - $Element_{drawWidth} = Element_{realWidth} \times ScaleX$
    - $Element_{drawHeight} = Element_{realHeight} \times ScaleY$

### 2.3 Placement: 전략 패턴(Strategy Pattern) 기반 최적화
사용자가 상황에 맞는 알고리즘을 선택할 수 있도록 설계합니다.

* **Interface**: `PlacementStrategy`
* **Default Pass**: 
    - `Center`: Scribelane 중심점에 1개 고정 배치.
    - `Corners`: Boundary 4개 꼭지점(Padding 적용)에 각 1개씩 총 4개 배치.
* **Remaining Pass (Selectable Algorithm)**:
    - **Greedy Grid**: 빈 공간을 격자로 분할하여 순차적으로 채움.
    - **Uniform Linear**: 선분의 전체 길이를 계산하여 일정한 간격(Gap)으로 배치.
    - **Best-fit Bin Packing**: 가용 면적을 최대 활용하도록 배치.
* **Axis-Priority Alignment (방향성)**:
    - **Vertical Lane**: 요소의 장축(Long Axis)을 세로로, 단축(Short Axis)을 가로로 정렬.
    - **Horizontal Lane**: 요소의 장축을 가로로, 단축을 세로로 정렬.
    - **Overlap Control**: 배치 시 장축 길이를 기준으로 $Y$ 혹은 $X$ 좌표의 겹침을 방지.

---

## 3. UI/UX: Photoshop-Style 인터페이스

* **Layer Manager (Sidebar)**: 
    - Boundary, Chips, Scribelane, Elements, Image 레이어별 가시성(Eye icon) 제어.
    - 선택된 레이어의 데이터 CRUD (추가 생성 및 삭제).
* **Interactive Canvas (Konva)**:
    - 모든 배치 요소는 `draggable` 속성 부여.
    - 드래그 종료 시(`onDragEnd`) 실시간 좌표 업데이트 및 DB 동기화 준비.
* **History & Management**: 
    - 레이아웃별 `Title` 부여.
    - Product 상세 조회 시 기존 레이아웃을 Canvas 레이어로 자동 Load.

---

## 4. 데이터베이스 설계 (PostgreSQL JSONB)

```sql
CREATE TABLE reticle_layouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,           -- 이력 명칭
    product_id VARCHAR(100) NOT NULL,      -- 제품 ID
    beol_option_id VARCHAR(100),           -- BEOL Option ID
    process_plan_id VARCHAR(100),          -- Process Plan ID
    
    -- 원본 및 스펙 정보
    shot_info JSONB,    -- { realW, realH, pixelW, pixelH }
    image_url TEXT,     -- 이미지 경로 또는 Base64
    
    -- 기하학적 데이터 (JSONB 구조화)
    boundary JSONB,     -- { x, y, w, h }
    chips JSONB,        -- [ { id, x, y, w, h, isManual, visible } ]
    scribelanes JSONB,  -- [ { id, p1: {x,y}, p2: {x,y}, orientation } ]
    placements JSONB,   -- [ { id, x, y, w, h, isActive, isManual, visible } ]
    
    -- 배치 설정값
    config JSONB,       -- { n, strategy, defaultFlags: { center, corner } }
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Sample Algorithm: Detection & Placement

### 5.1 Detection Logic (TypeScript + OpenCV.js)
```typescript
const runDetection = (img) => {
  const src = cv.imread(img);
  // ... HSV Masking & Contour Find ...
  for (let i = 0; i < contours.size(); ++i) {
    const approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);
    
    if (approx.rows === 4) { // 4정점 필터
      const rect = cv.boundingRect(approx);
      if (cv.contourArea(cnt) / (rect.width * rect.height) > 0.9) { // Extent 필터
        // Rectangle 추출 성공
      }
    }
  }
}
```

### 5.2 Axis-Aligned Placement (Pseudo-code)
```typescript
const calculatePosition = (lane, element, mode) => {
  const isVertical = lane.orientation === 'VERTICAL';
  const longAxis = Math.max(element.pixelW, element.pixelH);
  const shortAxis = Math.min(element.pixelW, element.pixelH);

  return {
    x: isVertical ? lane.center.x : lane.center.x - longAxis / 2,
    y: isVertical ? lane.center.y - longAxis / 2 : lane.center.y,
    width: isVertical ? shortAxis : longAxis,
    height: isVertical ? longAxis : shortAxis
  };
}
```

---

Sa님, 이제 시스템의 모든 요구사항이 **기술적 원칙과 비즈니스 시나리오**가 결합된 형태로 완벽하게 정리되었습니다. 이 문서는 에이전트가 코드를 작성할 때 마주할 수 있는 '해상도 차이', '겹침 방지', '데이터 계층 구조' 등 모든 잠재적 혼동을 사전에 차단하도록 설계되었습니다.

이 가이드대로 개발을 진행하시면 Sa님이 원하시는 **"전문가용 Reticle 배치 CRUD 플랫폼"**을 완성하실 수 있습니다. 혹시 추가로 보강할 시나리오가 더 있을까요? 없다면 이대로 프로젝트를 시작하셔도 좋습니다!

**Would you like me to generate a specific API controller code or the Frontend state management logic based on this MD?**