나중에 시스템이 커졌을 때(메뉴가 50개 이상, 버튼이 100개 이상)를 대비하여, 현재의 단순 RBAC(Role-Based Access Control)를 **Fine-grained RBAC(세부 권한 제어)**로 업그레이드하기 위한 가이드라인입니다.

이 구조는 **"사용자가 어떤 역할을 가졌는가(Role)"**가 아니라 **"이 사용자가 이 버튼을 누를 권한(Permission)이 있는가"**를 체크하는 것이 핵심입니다.

---

# 📑 Guide: Fine-grained Access Control System (RBAC 2.0)

## 1. 개요 (Concept)
기존의 `User -> Role` 구조 사이에 `Permission` 레이어를 추가하여, 소스 코드 수정 없이 DB 설정만으로 특정 메뉴나 버튼의 노출 여부를 제어할 수 있게 합니다.



---

## 2. 데이터베이스 설계 (Prisma Schema)

기존 `User`와 `Role` 모델은 유지하되, 권한의 최소 단위인 `Permission`과 다대다 매핑 테이블을 추가합니다.

```prisma
// 1. 권한 (Permission): 가장 작은 기능 단위
model Permission {
  id          Int              @id @default(autoincrement())
  code        String           @unique // 예: "MENU_KEY_DESIGN", "BTN_REQUEST_APPROVE"
  name        String           // 예: "Key 디자인 메뉴 접근", "의뢰 승인 버튼"
  category    String           // "MENU", "BUTTON", "API" 등 분류
  roles       RolePermission[]

  @@map("permissions")
}

// 2. 역할-권한 매핑 (RolePermission): N:M 관계 해소
model RolePermission {
  roleId       Int        @map("role_id")
  permissionId Int        @map("permission_id")
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

// 3. 기존 Role 모델 수정 (Relation 추가)
model Role {
  id          Int              @id @default(autoincrement())
  name        String           @unique
  permissions RolePermission[]
  users       User[]

  @@map("roles")
}
```

---

## 3. 백엔드 구현 전략 (NestJS)

### 3.1 Permission Guard 작성
API 호출 시 해당 유저의 Role이 필요한 Permission Code를 가지고 있는지 검사합니다.

```typescript
// decorators/permissions.decorator.ts
export const RequirePermission = (code: string) => SetMetadata('permission', code);

// guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JWT에서 추출된 유저 정보

    // 유저의 Role에 할당된 모든 Permission Code를 조회 (DB 또는 Redis 캐시)
    const userPermissions = await this.authService.getUserPermissionCodes(user.id);
    
    return userPermissions.includes(requiredPermission);
  }
}
```

### 3.2 Controller 적용
```typescript
@Get(':id')
@RequirePermission('MENU_REQUEST_DETAIL') // 해당 권한이 있어야 API 호출 가능
@UseGuards(JwtAuthGuard, PermissionsGuard)
async getRequest(@Param('id') id: string) { ... }
```

---

## 4. 프런트엔드 구현 전략 (React + Zustand)

### 4.1 전역 스토어 확장
로그인 시 유저 정보와 함께 유저가 가진 모든 **Permission Code 배열**을 가져와 저장합니다.

```typescript
// store/useAuthStore.ts
interface AuthState {
  user: User | null;
  permissions: string[]; // ["MENU_ADMIN", "BTN_DELETE", ...]
  checkPermission: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  permissions: [],
  checkPermission: (code) => get().permissions.includes(code),
}));
```

### 4.2 권한 게이트 컴포넌트 (PermissionGate)
JSX 내에서 특정 요소를 감싸서 노출 여부를 결정합니다.

```tsx
// components/auth/PermissionGate.tsx
export const PermissionGate = ({ code, children, fallback = null }) => {
  const hasPermission = useAuthStore(state => state.checkPermission(code));
  
  if (!hasPermission) return fallback;
  return <>{children}</>;
};

// 사용 예시
<PermissionGate code="BTN_STEP3_APPROVE">
  <button className="bg-blue-600 px-4 py-2">결재 상신</button>
</PermissionGate>
```

---

## 5. 단계별 적용 로드맵 (Migration Plan)

당장 적용하기 어렵다면 아래 순서로 천천히 진행하세요.

1.  **Phase 1 (준비):** `Permission` 테이블을 만들고 현재 사용 중인 모든 메뉴와 주요 버튼에 대한 코드를 미리 정의합니다.
2.  **Phase 2 (백엔드):** 로그인 성공 시 유저의 Role에 따른 Permission 리스트를 함께 리턴하도록 API를 수정합니다. (JWT Payload에 넣는 것도 방법)
3.  **Phase 3 (프런트엔드):** 하드코딩된 `role === 'ADMIN'` 로직을 `checkPermission('...')` 함수로 하나씩 교체합니다.
4.  **Phase 4 (관리자 UI):** ADMIN 페이지에서 특정 Role에 Permission을 체크박스로 넣고 뺄 수 있는 UI를 구현합니다.

---

## 💡 설계 팁
* **권한 코드 규칙:** `CATEGORY:ACTION:TARGET` 형식을 추천합니다. (예: `MENU:VIEW:REQUEST`, `BTN:CLICK:APPROVE`)
* **상속 구조:** "ADMIN은 모든 권한을 가짐"이라는 예외 로직을 `PermissionsGuard`에 넣어두면 일일이 체크하지 않아도 되어 편리합니다.

**이 가이드가 미래의 시스템 고도화에 도움이 되길 바랍니다!** 추가로 궁금한 구현 디테일이 생기면 언제든 말씀해 주세요. 😎