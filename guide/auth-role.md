네, 요청하신 대로 **인증(Authentication) 및 인가(Authorization)** 부분에만 집중하여, 로컬 개발과 사내 운영 환경을 유연하게 오갈 수 있는 고도화된 설계 가이드를 작성해 드립니다.

---

# 🔐 RFGo System: Auth & AuthZ Architecture Spec

이 문서는 사내 SSO 연동의 불확실성을 해결하고, **어댑터 패턴(Adapter Pattern)**을 통해 환경 변화에 독립적인 인증 시스템을 구축하는 것을 목표로 합니다.

## 1. Database Schema (RBAC 기반 설계)

사용자 정보와 역할(Role)을 분리하여, 향후 'RFG 담당자'나 'Innovation 담당자' 외에 새로운 권한이 추가되어도 대응 가능하도록 설계합니다.

```prisma
// prisma/schema.prisma

model User {
  id            Int      @id @default(autoincrement())
  epId          String   @unique // 사번 (SSO 식별자)
  userId        String   @unique // 시스템 ID (Knox ID 등)
  fullName      String
  deptName      String
  email         String
  roleId        Int      // Role 테이블과 연결
  role          Role     @relation(fields: [roleId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 의뢰 및 작업 이력 관계
  requests      Request_Items[]
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique // ADMIN, RFG, INNO, USER
  description String?
  users       User[]
}
```

---

## 2. Authentication Sequence (Adapter Pattern)

로컬 개발 시에는 SSO 서버 없이 Mock 데이터를 사용하고, 운영 서버에서는 실제 사내 SSO API를 호출하는 구조입니다.



1. **Access**: 유저가 웹 접속 (JWT 쿠키 없음).
2. **Redirect**: React가 NestJS `/auth/sso/login`으로 안내.
3. **SSO Logic**: 
   - **Dev**: `DevSsoAdapter`가 즉시 Mock 프로필 반환.
   - **Prod**: 사내 SSO 인증 페이지 경유 후 `InternalSsoAdapter`가 프로필 획득.
4. **JWT Issue**: NestJS가 JWT를 생성하여 **HttpOnly Cookie**에 저장 후 React로 리다이렉트.
5. **Session Store**: React가 `/me`를 호출하여 정보를 받고 **Zustand**에 저장.

---

## 3. Backend Implementation (Design Pattern)

### 3.1 SsoAdapter 인터페이스 및 구현
추상 클래스를 활용하여 결합도를 낮춥니다.

```typescript
// src/auth/adapters/sso.adapter.ts
export abstract class SsoAdapter {
  abstract validate(code: string): Promise<SsoUserProfile>;
}

// src/auth/adapters/dev-sso.adapter.ts
@Injectable()
export class DevSsoAdapter implements SsoAdapter {
  async validate(code: string): Promise<SsoUserProfile> {
    // 로컬 개발용 가짜 데이터
    return { epId: '12345678', fullName: '테스터', deptName: '개발팀', email: 'test@samsung.com' };
  }
}

// src/auth/adapters/internal-sso.adapter.ts
@Injectable()
export class InternalSsoAdapter implements SsoAdapter {
  async validate(code: string): Promise<SsoUserProfile> {
    // 실제 사내 API 호출 로직 (Axios 등 활용)
    const response = await axios.post('https://sso.internal.com/token', { code });
    return response.data; 
  }
}
```

### 3.2 Module 설정 (로직 갈아끼우기)
환경 변수 하나로 로직이 완전히 교체됩니다.

```typescript
// src/auth/auth.module.ts
@Module({
  providers: [
    AuthService,
    {
      provide: SsoAdapter,
      useClass: process.env.NODE_ENV === 'production' ? InternalSsoAdapter : DevSsoAdapter,
    },
  ],
})
export class AuthModule {}
```

---

## 4. Frontend Implementation (Zustand & Guard)

### 4.1 Zustand User Store
유저 정보와 권한 검사 기능을 중앙 집중화합니다.

```typescript
// src/store/useUserStore.ts
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  role: null, // 'ADMIN' | 'RFG' | 'INNO' | 'USER'
  setUser: (data) => set({ user: data, role: data.role.name }),
  hasRole: (requiredRoles: string[]) => {
    const userRole = get().role;
    return userRole ? requiredRoles.includes(userRole) : false;
  }
}));
```

### 4.2 React 권한 제어 가이드
"거의 사각형에 가까운" 디자인 톤을 유지하면서 권한별 제약을 적용합니다.

```tsx
// src/components/common/PermissionGate.tsx
export const PermissionGate = ({ allowedRoles, children }) => {
  const hasRole = useUserStore((state) => state.hasRole);
  
  // 권한이 없으면 렌더링하지 않거나 '권한 없음' 메시지 노출
  if (!hasRole(allowedRoles)) return null; 
  return <>{children}</>;
};

// 사용 예시: RFG 파트만 Reference 지정 버튼 노출
<PermissionGate allowedRoles={['ADMIN', 'RFG']}>
  <button className="rounded-sm border border-slate-200 bg-white p-2 text-sm shadow-sm">
    Reference Table 지정
  </button>
</PermissionGate>
```

---

## 5. 개발-운영 관점 가이드 (Developer Note)

1. **로컬 개발 시**: `.env`에 `NODE_ENV=development`를 설정하면 사내망 연결 없이도 모든 기능을 테스트할 수 있습니다.
2. **사내 이관 시**: `InternalSsoAdapter` 내부의 API Endpoint 주소만 사내 규격에 맞게 수정하면 됩니다.
3. **인가 보안**: Frontend의 `PermissionGate`는 UI 편의용입니다. 모든 NestJS Controller에는 `@UseGuards(RolesGuard)`를 붙여 **서버 측에서 이중 검증**을 반드시 수행해야 합니다.

---

**이 기획서의 인증/인가 구조가 만족스러우신가요?** 이대로 `GEMINI.md`에 반영하여 개발을 진행하시면 사내 시스템 연계 시 발생할 수 있는 리스크를 최소화할 수 있습니다. 추가로 수정이 필요한 부분이 있다면 말씀해 주세요!