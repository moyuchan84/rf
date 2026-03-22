제시해주신 아키텍처를 기반으로, **사용자별 메일링 리스트 관리**, **Admin 전용 시스템 메일링 관리**, 그리고 **의뢰서 작성 시 수신처 병합 로직**을 구체화한 `GEMINI-CLI`용 마카다운 스크립트를 작성해 드립니다.

이 가이드는 **Clean Architecture**의 인터페이스 분리 원칙을 준수하며, Frontend와 Backend가 어떻게 상호작용하여 "시스템 기본 + 사용자 선택 + 추가 인원"을 하나의 `Watcher` 리스트로 병합하는지에 초점을 맞춥니다.

---

# 📄 GEMINI-CLI: User & Admin Mail Management Implementation

## 1. Backend: Domain Logic & Resolvers

### 1.1 Mail Group Management (User & Admin)
사용자와 관리자가 각각 자신의 메일링 리스트를 관리하기 위한 CRUD 로직입니다.

```typescript
// backend/src/mailing/mailing.resolver.ts

@Resolver()
export class MailingResolver {
  constructor(private mailingService: MailingService) {}

  // [User] 개인 메일링 그룹 조회/생성/삭제
  @Query(() => [UserMailGroup])
  @UseGuards(JwtAuthGuard)
  async myMailGroups(@CurrentUser() user: User) {
    return this.mailingService.getUserGroups(user.id);
  }

  // [Admin] 시스템 기본 수신처 설정 (전용 Guard 적용)
  @Mutation(() => SystemDefaultMailer)
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateSystemDefaultMailer(
    @Args('category') category: string,
    @Args('recipients', { type: () => [EmployeeInput] }) recipients: EmployeeDto[]
  ) {
    return this.mailingService.updateSystemDefault(category, recipients);
  }
}
```

### 1.2 Watcher 병합 로직 (WatcherService 확장)
의뢰 생성 시 `System Default`와 `User Selection`을 중복 없이 합치는 핵심 비즈니스 로직입니다.

```typescript
// backend/src/mailing/watcher.service.ts

@Injectable()
export class WatcherService {
  async initializeWatchers(requestId: number, category: string, userSelected: EmployeeDto[]) {
    // 1. 시스템 기본 수신처 가져오기
    const defaultMailer = await this.prisma.systemDefaultMailer.findUnique({ where: { category } });
    const defaultRecipients = defaultMailer?.recipients as EmployeeDto[] || [];

    // 2. 중복 제거 병합 (userId 또는 epId 기준)
    const allWatchers = this.mergeUniqueRecipients([...defaultRecipients, ...userSelected]);

    // 3. RequestWatcher 테이블 저장 (Jira Watcher 역할)
    return this.prisma.requestWatcher.create({
      data: {
        requestId,
        watchers: allWatchers as any,
      }
    });
  }

  private mergeUniqueRecipients(list: EmployeeDto[]): EmployeeDto[] {
    const map = new Map();
    list.forEach(emp => map.set(emp.userId || emp.epId, emp));
    return Array.from(map.values());
  }
}
```

---

## 2. Frontend: UI Components & Global State

### 2.1 Zustand Store: Mail Selection Context
의뢰서 작성 중 선택된 메일링 리스트를 임시 저장합니다.

```typescript
// frontend/src/store/useMailSelectorStore.ts

export const useMailSelectorStore = create((set) => ({
  selectedGroupIds: [],
  manualRecipients: [], // 인명 검색으로 추가된 개별 인원
  
  toggleGroup: (groupId) => set((state) => ({
    selectedGroupIds: state.selectedGroupIds.includes(groupId) 
      ? state.selectedGroupIds.filter(id => id !== groupId)
      : [...state.selectedGroupIds, groupId]
  })),
  addManualRecipient: (emp) => set((state) => ({
    manualRecipients: [...state.manualRecipients, emp]
  })),
  reset: () => set({ selectedGroupIds: [], manualRecipients: [] })
}));
```

### 2.2 UI: MailSelector Component (React)
"거의 사각형에 가까운(rounded-sm)" 디자인 톤을 유지한 메일 선택 UI입니다.

```tsx
// frontend/src/components/mailing/MailSelector.tsx

export const MailSelector = () => {
  const { myGroups } = useMyMailGroups(); // GraphQL Query Hook
  const { toggleGroup, addManualRecipient, selectedGroupIds } = useMailSelectorStore();

  return (
    <div className="border border-slate-200 rounded-sm p-4 bg-white shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-slate-700">메일 수신처 설정</h3>
      
      {/* 1. 개인 즐겨찾기 그룹 섹션 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {myGroups.map(group => (
          <button
            key={group.id}
            onClick={() => toggleGroup(group.id)}
            className={`px-3 py-1 text-xs border rounded-sm transition-all ${
              selectedGroupIds.includes(group.id) ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {group.groupName} ({group.members.length})
          </button>
        ))}
      </div>

      {/* 2. 인명 검색 컴포넌트 연동 */}
      <EmployeeSearchAutocomplete 
        onSelect={(emp) => addManualRecipient(emp)} 
        placeholder="추가 수신인 검색..."
      />
      
      <p className="mt-2 text-[11px] text-slate-400 italic">
        * 시스템 기본 수신처(RFG/INNO 담당)는 자동으로 포함됩니다.
      </p>
    </div>
  );
};
```

---

## 3. Workflow 시나리오: Request Submission

1. **User Action**: 사용자가 의뢰서 작성 페이지에서 `MailSelector`를 통해 그룹 및 추가 인원을 선택합니다.
2. **Submit**: `createRequestItem` 호출 시 선택된 인원들의 리스트를 `initialWatchers` 배열로 전달합니다.
3. **Backend Logic**: 
   - `RequestsService`가 의뢰 아이템을 생성합니다.
   - 동시에 `WatcherService.initializeWatchers`를 호출하여 **[시스템 기본 + 유저 선택 그룹 멤버 + 추가 검색 인원]**을 하나의 `RequestWatcher` 레코드로 생성합니다.
4. **Notification**: `MailWorkflowService`가 생성된 `RequestWatcher`를 기반으로 `RequestCreatedStrategy` (Handlebars)를 적용하여 첫 메일을 발송합니다.

---

## 4. Admin Page: System Mailer Management
관리자 페이지에서 `SystemDefaultMailer`를 관리하는 가이드입니다.

* **UI**: `AdminDashboard` 내 `Mailing Settings` 탭 구성.
* **Function**: `category`별(예: PHOTO_ALL, BEOL_COMMON) 수신처 편집 기능. 
* **Effect**: 여기서 수정된 인원은 이후 생성되는 모든 해당 카테고리 의뢰서의 **필수 수신인**이 됩니다.

---

### **💡 전문가의 팁: "Audit & Scale"**
* **History**: `RequestWatcher`의 `watchers` 필드가 JSONB이므로, 누가 언제 추가되었는지 `addedAt` 속성을 객체 안에 포함하면 나중에 "왜 나한테 메일이 오느냐"는 문의에 대응하기 좋습니다.
* **Performance**: 수신처가 100명이 넘어가는 대규모 의뢰의 경우, 메일 발송 로직을 `Bull` 큐로 넘겨 `Request` 생성이 지연되지 않도록 처리하세요.

**이 설계 내용을 `GEMINI.md` 최종본에 업데이트할까요?** 혹은 특정 관리 화면(Admin용 수신처 편집기)의 상세 코드가 더 필요하신가요?