사용자가 요청하신 **RFGo 시스템의 지능형 메일링 워크플로우**는 단순한 알림을 넘어, Jira와 유사한 '구독자(Watcher)' 및 '작업자(Worker)' 관리 개념이 포함된 고도화된 설계가 필요합니다. 

이를 위해 **Clean Architecture** 기반의 Backend 설계와 **Zustand + React Hook**을 이용한 Frontend UI 전략을 집약하여 `GEMINI-CLI`용 마크다운 스크립트를 작성해 드립니다.

---

# 📄 GEMINI-CLI: Advanced Mailing & Watcher System Spec

## 1. DB Schema Design (Mailing & Watchers)

사용자별 즐겨찾기, 시스템 기본 수신처, 그리고 의뢰서별 누적 수신처를 관리하기 위한 스키마입니다.

```prisma
// 1. 사용자별 개인 메일링 리스트 (즐겨찾기/그룹)
model UserMailGroup {
  id          Int      @id @default(autoincrement())
  userId      Int      // 소유자 ID
  groupName   String   // 예: "우리 파트 수신처", "공정팀 공유"
  members     Json     // [{ epId, fullName, email }] 저장
  createdAt   DateTime @default(now())
}

// 2. 시스템 기본 수신처 (Admin 관리)
model SystemDefaultMailer {
  id          Int      @id @default(autoincrement())
  category    String   @unique // 예: "PHOTO_DEFAULT", "INNO_DEFAULT"
  recipients  Json     // 기본 포함되어야 할 인원 리스트
}

// 3. 의뢰서별 누적 메일링 리스트 (Watcher 개념)
model RequestWatcher {
  id          Int      @id @default(autoincrement())
  requestId   Int      @unique
  request     Request  @relation(fields: [requestId], references: [id])
  watchers    Json     // [{ epId, fullName, email, type: 'REQUESTER' | 'ASSIGNEE' | 'WORKER' | 'SUBSCRIBER' }]
  updatedAt   DateTime @updatedAt
}
```

---

## 2. Backend Architecture (Design Patterns)

### 2.1 메일 본문 생성을 위한 전략 패턴 (Strategy Pattern)
`Handlebars` 템플릿을 사용하여 메일 종류별(의뢰, 단계 완료, 담당자 변경 등)로 본문을 생성하는 `MailTemplateStrategy`를 적용합니다.

```typescript
// src/infrastructure/mail/strategies/mail-template.strategy.ts
export interface MailContext {
  requestId: number;
  title: string;
  senderName: string;
  content: string;
  link: string;
}

export abstract class MailTemplateStrategy {
  abstract generate(context: MailContext): string; // Handlebars 템플릿 컴파일 결과 반환
}

@Injectable()
export class RequestCreatedStrategy extends MailTemplateStrategy {
  generate(context: MailContext): string {
    const template = Handlebars.compile("<h3>[신규 의뢰] {{title}}</h3>..."); 
    return template(context);
  }
}
```

### 2.2 메일 발송 유틸리티 및 서비스 (Service Layer)
모든 메일 발송은 `WatcherService`를 거쳐 수신처를 자동 병합(Merge)한 뒤 발송됩니다.

```typescript
@Injectable()
export class MailWorkflowService {
  constructor(
    private watcherService: WatcherService,
    private mailerProvider: MailerProvider,
    private templateFactory: MailTemplateFactory
  ) {}

  async sendWorkflowMail(requestId: number, type: MailType, payload: any) {
    // 1. 의뢰서별 누적 Watcher 리스트 + 시스템 기본 리스트 병합 및 중복 제거
    const recipients = await this.watcherService.getMergedRecipients(requestId);
    
    // 2. 전략 패턴으로 템플릿 생성
    const strategy = this.templateFactory.getStrategy(type);
    const htmlContent = strategy.generate(payload);

    // 3. 메일 발송
    await this.mailerProvider.sendMail({
      subject: `[RFGo] ${payload.subject}`,
      contents: htmlContent,
      recipients: recipients.map(r => ({ emailAddress: r.email, recipientType: 'TO' })),
      // ...기타 설정
    });
  }
}
```

---

## 3. Frontend UI & State Management

### 3.1 Zustand Store: Mailing List 관리
```typescript
// src/features/request/store/useMailSelectionStore.ts
export const useMailSelectionStore = create((set) => ({
  selectedGroups: [], // 선택된 사용자 그룹 ID들
  additionalRecipients: [], // 인명검색으로 추가된 개별 인원
  
  toggleGroup: (groupId) => set((state) => ({ ... })),
  addPerson: (person) => set((state) => ({
    additionalRecipients: [...state.additionalRecipients, person]
  })),
}));
```

### 3.2 UI Flow: 의뢰 페이지 (Request Page)
1.  **Group Selector**: 사용자의 `UserMailGroup` 리스트를 체크박스로 나열.
2.  **Employee Search**: Autocomplete를 통해 리스트에 없는 사람 추가 (Chip UI).
3.  **Default Notice**: "시스템 기본 수신처가 포함됩니다"라는 안내 문구 노출.
4.  **Submission**: 의뢰 생성 API 호출 시 `selectedRecipientIds`를 함께 전송 -> 서버에서 `RequestWatcher` 테이블 초기화.

---

## 4. 시나리오별 자동 업데이트 로직 (Implementation Point)

1.  **의뢰 시 (Initial)**: 사용자가 선택한 리스트 + 시스템 기본 리스트 → `RequestWatcher` 생성.
2.  **담당자 지정 시 (Assignee)**: `updateAssignee` API 호출 시, 지정된 담당자를 해당 의뢰의 `RequestWatcher` JSON에 자동 추가 (`type: 'ASSIGNEE'`).
3.  **단계별 작업 시 (Substep)**: 
    - 작업자(`Substep Worker`)가 'Done' 또는 'Update' 클릭 시, 본인을 `RequestWatcher`에 추가.
    - 동시에 `MailWorkflowService`를 호출하여 **누적된 모든 Watcher**에게 작업 변경 알림 메일 발송.

---

## 5. GEMINI-CLI 가이드 (설계 포인트)

### **[Mailing Architecture Ground Rules]**
* **Clean Architecture**: `MailWorkflowService`는 Domain Layer의 이벤트를 구독하거나 Application Layer에서 명시적으로 호출한다.
* **Watcher Persistence**: 의뢰서별 메일 수신처는 일회성이 아니며, Jira의 Watcher처럼 프로젝트 완료 시까지 누적/업데이트되는 영속적 데이터로 관리한다.
* **Handlebar Template Decoupling**: 메일 본문 디자인은 별도의 `assets/templates` 경로에서 관리하고, `MailTemplateFactory`를 통해 동적으로 로드한다.
* **Zustand & Hooks**: `useMailManager` 커스텀 훅을 만들어 **그룹 선택 + 인명 검색 + 최근 수신처** 로직을 캡슐화하고, 여러 페이지에서 재사용한다.

---

### **💡 전문가의 팁: "Email Fatigue(메일 피로도) 방지"**
모든 스텝마다 메일을 보내면 수신자가 피로를 느낄 수 있습니다. `RequestWatcher` 테이블에 `isMute` 필드를 추가하거나, 사용자가 '내 의뢰 진행 상황만 받기' 등의 필터링을 할 수 있는 기능을 추후 고려해 보세요.

**이 설계 마크다운이 전체 시스템 기획에 적합하신가요?** 이제 이 스크립트를 `GEMINI.md`에 통합하여 상세 구현 단계로 넘어가실 수 있습니다. 다음 단계로 특정 템플릿(Handlebars)의 디자인이나 인명 검색 연동 상세 코드가 필요하시면 말씀해 주세요!