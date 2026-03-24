사내 메모결재 시스템의 복잡한 **결재선(Path)** 관리와 **상신(Submission)** 프로세스를 RFGo 시스템에 완벽하게 통합하기 위한 최종 개발 가이드입니다. 

사용자가 메일링 주소록을 관리하듯 **개인별 결재 경로 즐겨찾기**를 관리하고, 이를 실제 상신 로직과 연결하는 **Clean Architecture** 기반의 구현 전략입니다.

---

# 📑 RFGo: Memo Approval & Path Management Specification

## 1. Database Schema (개인 결재 경로 저장)
메일링 그룹과 유사하게, 사용자가 자주 사용하는 결재선을 저장하고 불러올 수 있는 구조입니다.

```prisma
// 사용자별 즐겨찾기 결재 경로
model UserApprovalPath {
  id          Int      @id @default(autoincrement())
  userId      Int      // 소유자 ID
  pathName    String   // 예: "공정 파트장 결재선", "기획팀 합의선"
  pathItems   Json     // ApprovalPathDto[] 형태의 배열 저장
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 결재 문서 이력 (RFGo 의뢰와 연동)
model ApprovalDocument {
  id          Int      @id @default(autoincrement())
  requestId   Int      @unique
  apInfId     String   @unique
  docNo       String?  // 결재 시스템에서 발급된 문서 번호
  status      String   // DRAFT, SUBMITTED, APPROVED, REJECTED
  payload     Json     // 상신된 전체 ApprovalRequestDto 스냅샷
}
```

---

## 2. Backend: Clean Architecture (NestJS)

### 2.1 Domain Layer (Service & Strategy)
결재 상신 시 **Handlebars**를 이용해 본문을 생성하고, 인터페이스를 통해 인프라 계층을 호출합니다.

```typescript
// src/domain/approval/approval.service.ts
@Injectable()
export class ApprovalService {
  constructor(
    private readonly provider: ApprovalProvider, // Adapter (Dev/Prod)
    private readonly prisma: PrismaService,
  ) {}

  async submitMemo(requestId: number, pathItems: ApprovalPathDto[], content: string) {
    // 1. DTO 구성 (apInfId 자동 생성 포함)
    const dto = new ApprovalRequestDto();
    dto.contents = content; // Handlebars로 생성된 HTML
    dto.aplns = pathItems.map((item, index) => ({
      ...item,
      seq: index.toString(), // 순번 자동 부여
    }));

    // 2. 인프라 호출 (Adapter 패턴)
    const response = await this.provider.submit(dto);

    // 3. 결과 저장 및 Step 상태 연동
    if (response.result === 'success') {
      await this.prisma.approvalDocument.create({
        data: { requestId, apInfId: response.data.apInfId, status: 'SUBMITTED' }
      });
    }
    return response;
  }
}
```

---

## 3. Frontend: User Interface & State (React)

### 3.1 Zustand Store (결재선 편집기)
인명 검색 결과와 즐겨찾기를 조합하여 결재선을 설계하는 상태 저장소입니다.

```typescript
// src/features/approval/store/useApprovalPathStore.ts
export const useApprovalPathStore = create((set) => ({
  currentPath: [], // 현재 설계 중인 ApprovalPathDto[]
  
  // 즐겨찾기 로드
  loadFavoritePath: (pathItems) => set({ currentPath: pathItems }),
  
  // 인명 검색에서 인원 추가
  addApprover: (employee, role) => set((state) => ({
    currentPath: [...state.currentPath, {
      epId: employee.epId,
      userId: employee.userId,
      emailAddress: employee.emailAddress,
      role: role, // 0:기안, 1:결재, 2:합의 등
      aplnStatsCode: '0'
    }]
  })),
  
  // 순서 변경 (Drag & Drop)
  reorderPath: (startIndex, endIndex) => set((state) => ({
    currentPath: arrayMove(state.currentPath, startIndex, endIndex)
  })),
}));
```

### 3.2 UI Components
* **`PathFavoriteManager`**: 저장된 결재선 목록을 보여주고, 현재 설정을 새 즐겨찾기로 저장하는 기능.
* **`ApprovalLineTable`**: 현재 결재선을 테이블 형태로 노출. `seq`, `role`(기안/결재/합의)을 드롭다운으로 수정 가능.
* **`MemoPreview`**: 상신 전 `Handlebars` 템플릿이 적용된 결재 본문을 미리 보여주는 Modal.

---

## 4. 시나리오 및 구현 포인트

### 4.1 개인 결재선 관리 및 사용
1.  **관리**: 사용자가 인명 검색을 통해 결재자 A, 합의자 B를 추가한 후 "공정 승인 라인"으로 저장합니다.
2.  **적용**: 의뢰서 작성 시 "결재선 불러오기" 버튼을 눌러 저장된 라인을 즉시 적용합니다.
3.  **수정**: 상황에 따라 특정 인원을 빼거나 순서를 바꾼 뒤 상신합니다.

### 4.2 상신 및 상태 동기화 (Step 3)
1.  **Trigger**: "결재 상신" 버튼 클릭 시 `useApprovalSubmit` 훅을 통해 API 호출.
2.  **Locking**: 상신 성공 시 해당 의뢰서의 데이터 수정은 금지되며, UI는 '결재 진행 중' 상태로 고정됩니다.
3.  **Callback**: 사내 시스템에서 승인/반려 시 `apInfId`를 기반으로 RFGo의 `ApprovalDocument` 상태를 업데이트하고 메일링 워크플로우를 트리거합니다.

---

## 💡 최종 설계 가이드 (GEMINI-CLI용)

### **[Mailing vs Approval Consistency]**
* **Mailing**: 다수에게 정보를 전달하는 '전파' 중심 -> `RequestWatcher`에 누적.
* **Approval**: 책임과 권한을 가진 '의사결정' 중심 -> `ApprovalPathDto`의 `role`과 `seq`에 따른 엄격한 순서 제어.

### **[Implementation Roadmap]**
1.  **Backend**: `SsoAdapter`와 동일한 방식으로 `ApprovalProvider` 인터페이스를 구현하고 `Dev/Prod` 모듈 전환 로직을 구성한다.
2.  **Frontend**: `EmployeeSearch` 컴포넌트를 재사용하여 `ApproverPicker`를 만들고, Zustand에서 결재선 배열을 관리한다.
3.  **Integration**: 상신 시 `attachments` 필드를 통해 VSTO에서 생성된 파일을 자동으로 멀티파트로 전송하는 로직을 추가한다.

**이제 모든 설계가 완성되었습니다!** 이 마크다운을 기반으로 코딩을 시작하시면 사내 시스템과 완벽하게 연동되는 전문적인 결재 워크플로우를 구축하실 수 있습니다. 추가로 특정 컴포넌트의 상세 코드(예: DND 결재선 편집기)가 필요하시면 언제든 요청해 주세요. 🚀

정말 긴 여정이었네요! 🚀 

비즈니스 로직부터 인증, 인명 검색, 메일링, 그리고 마지막 메모 결재의 아주 상세한 DTO 구조까지... 거의 완벽한 **시스템 설계도(Blueprint)**가 완성되었습니다. 

이제 이 내용들을 바탕으로 코딩을 시작하시면, 나중에 사내망(S-Net)으로 소스를 옮겼을 때 큰 수정 없이 `Adapter` 클래스만 갈아끼우는 것으로 운영 배포가 가능할 거예요. 

구현하시다가 막히는 부분(예: "Zustand에서 결재선 순서 바꾸는 로직이 꼬여요" 등)이나, 엑셀 파싱 알고리즘 같은 기술적인 디테일이 필요하면 언제든 다시 찾아주세요. 

