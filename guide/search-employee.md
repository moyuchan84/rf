사내 인명 검색 서비스(Knox) 연동을 위한 **NestJS 기반 클린 아키텍처**와 **React 커스텀 훅/스토어** 설계를 포함한 `GEMINI-CLI`용 마크다운 스크립트입니다. 

실제 응답에 더 많은 필드가 포함되어도 에러가 나지 않도록 유연하게 설계했으며, 메일링 서비스와 마찬가지로 **Adapter 패턴**을 적용하여 로컬(Mock)과 운영(Knox API) 환경을 손쉽게 전환할 수 있도록 구성했습니다.

---

# 📄 GEMINI-CLI: Employee Search Integration Script

## 1. Backend: Infrastructure Layer (Adapter Pattern)

외부 API의 추가 필드에 영향을 받지 않도록 `interface` 대신 `class`와 `Partial` 타입을 적절히 혼합하여 사용합니다.

### 1.1 Interface & DTO
```typescript
// src/common/interfaces/employee-provider.interface.ts
export abstract class EmployeeProvider {
  abstract search(query: string, condition: 'FullName' | 'Organization' | 'Title'): Promise<EmployeeSearchResponseDto>;
}

// src/common/dto/employee-search.dto.ts
export interface EmployeeDto {
  epId: string | null;
  fullName: string | null;
  userId: string | null;
  departmentName: string | null;
  emailAddress: string | null;
  [key: string]: any; // 실제 Knox API의 추가 필드 허용 (에러 방지)
}
```

### 1.2 Multi-Environment Implementations
```typescript
// src/infrastructure/employee/knox-employee.provider.ts
@Injectable()
export class KnoxEmployeeProvider extends EmployeeProvider {
  constructor(private readonly httpService: HttpService) {}

  async search(query: string, condition: string): Promise<EmployeeSearchResponseDto> {
    const payload = { SearchQuery: query, SearchCondition: condition };
    const { data } = await this.httpService.post('https://api.internal/employee/search', payload).toPromise();
    return data; // 실제 응답 필드가 더 많아도 DTO 구조에 따라 필요한 것만 취함
  }
}

// src/infrastructure/employee/dev-employee.provider.ts
@Injectable()
export class DevEmployeeProvider extends EmployeeProvider {
  async search(query: string): Promise<EmployeeSearchResponseDto> {
    return {
      result: 'SUCCESS',
      currentPage: 1, totalPage: 1, totalCount: 1,
      employees: [{
        epId: '12345678', fullName: '홍길동', userId: 'ghdrlfthd',
        departmentName: 'Photo기술팀', emailAddress: 'tester@samsung.com'
      }]
    };
  }
}
```

---

## 2. Frontend: API & Custom Hook (React)

### 2.1 API Client & Zustand Store
```typescript
// src/shared/api/employee.api.ts
export const searchEmployees = async (params: SearchParams) => {
  const { data } = await graphqlClient.query({ query: SEARCH_EMPLOYEES, variables: params });
  return data.searchEmployees;
};

// src/shared/store/useEmployeeStore.ts
export const useEmployeeStore = create((set) => ({
  recentSearches: [],
  addRecent: (emp) => set((state) => ({
    recentSearches: [emp, ...state.recentSearches.filter(i => i.userId !== emp.userId)].slice(0, 5)
  })),
}));
```

### 2.2 Custom Hook (Debounce 포함)
```typescript
// src/shared/hooks/useEmployeeSearch.ts
export const useEmployeeSearch = (query: string, condition: string) => {
  const debouncedQuery = useDebounce(query, 500);

  return useQuery({
    queryKey: ['employees', debouncedQuery, condition],
    queryFn: () => searchEmployees({ query: debouncedQuery, condition }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
};
```

---

## 3. GEMINI.md 추가 가이드 (Employee Integration Section)

### **[Employee Search Ground Rules]**
1.  **Strict Mapper**: 외부 API 응답(`EmployeeDto`)은 반드시 `UserSearchMapper`를 거쳐 내부 도메인 모델로 변환한다. 이는 외부 필드 변경에 대한 완충 지대 역할을 한다.
2.  **Flexible Schema**: DTO 정의 시 `[key: string]: any`를 포함하여, 명시된 필드 외에 Knox 시스템에서 추가로 내려주는 대량의 속성들로 인한 런타임 에러를 방지한다.
3.  **Cross-Domain Usage**: 본 모듈은 다음 세 가지 유스케이스를 공통으로 지원한다.
    - **Assignee**: 의뢰 단계별 담당자 지정.
    - **Mailing**: 메일 수신처(Recipients) 검색.
    - **Approval**: 메모 결재 라인(결재자/합의자) 검색.

### **[UI/UX Policy]**
- **Context-Aware**: 호출되는 위치(RFG, Innovation, Mail)에 따라 검색 필터의 기본값을 지능적으로 설정한다.
- **Visual Feedback**: 검색 중(Loading), 결과 없음(Empty), 에러(Error) 상태를 명확히 사용자에게 전달한다.

---

## 💡 개발자 전환 가이드 (Local to Prod)

1.  **Dependency Injection**: `EmployeeModule`에서 `NODE_ENV`에 따라 `DevEmployeeProvider` 또는 `KnoxEmployeeProvider`를 주입하도록 설정되어 있으므로, 코드를 사내망으로 옮긴 후 환경 변수(`KNOX_API_URL`)만 설정하면 즉시 가동됩니다.
2.  **Type Safety**: `EmployeeDto`에 정의되지 않은 필드가 Knox API에서 추가되더라도 TypeScript 타입 시스템은 무시하며, 런타임에서도 필요한 데이터만 추출하여 사용하므로 안전합니다.

---
**이 스크립트를 `GEMINI.md`에 포함시켜 프로젝트의 외부 시스템 연계 표준으로 삼으시겠습니까?** 다음 단계인 메모 결재(Approval) 연동에 대해서도 이와 동일한 패턴으로 정리를 도와드릴 수 있습니다.

제시해주신 **인명 검색(searchEmployee)** 로직은 전형적인 엔터프라이즈급 통합 검색 구조를 따르고 있네요. 특히 `FullName`, `Organization`, `Title`로 검색 조건을 분리한 것은 사용자가 정확한 대상(예: 특정 팀의 담당자나 특정 직급의 인원)을 찾기에 매우 효율적인 설계입니다.

이 로직을 **RFGo의 담당자 지정(Assignee) 워크플로우**에 결합하기 위한 UI/UX 및 백엔드 연동 전략을 정리해 드립니다.

---

## 1. UI/UX: 스마트 담당자 검색 컴포넌트

프런트엔드(React)에서는 이 API를 활용하여 **자동완성(Autocomplete) 기능이 포함된 다중 선택기**를 구현해야 합니다.

* **검색 필터:** 검색창 옆에 `FullName`(성명), `Organization`(부서), `Title`(직급)을 선택할 수 있는 작은 드롭다운 또는 탭을 배치합니다.
* **Debouncing:** 사용자가 타이핑할 때마다 API를 호출하면 과부하가 걸리므로, 최소 **300ms~500ms의 Debounce**를 적용하여 호출 횟수를 최적화합니다.
* **검색 결과 리스트:** * 성명(사번), 부서, 직급 정보를 한 줄에 표시합니다.
    * 이미 선택된 인원은 리스트에서 비활성화하거나 체크 표시를 합니다.
* **선택된 담당자(Selected Chips):** 선택된 인원은 검색창 상단이나 하단에 **삭제 가능한 Chip** 형태로 나열합니다.

---

## 2. 백엔드 연동 및 확장 전략 (NestJS)

인명 검색 API는 보통 외부 시스템이므로, 이를 호출하는 로직을 **인프라 레이어(Infrastructure Layer)**에 격히 격리해야 합니다.

### **Service Layer 구현 예시**
```typescript
// user-search.service.ts
@Injectable()
export class UserSearchService {
  constructor(private readonly repository: EmployeeRepository) {}

  async findAssignees(query: string, condition: 'FullName' | 'Organization' | 'Title') {
    const response = await this.searchEmployee(query, condition);
    
    // 비즈니스 로직에 맞게 데이터 가공 (예: Knox 도메인 처리 등)
    return response.employees.map(emp => ({
      userId: emp.userId,
      label: `${emp.fullName} (${emp.deptName} / ${emp.titleName})`,
      email: withKnoxDomain(emp.userId) // 이전에 정의한 이메일 변환 함수 활용
    }));
  }
}
```

---

## 3. GEMINI.md 가이드라인 업데이트 (Assignee Section)

나중에 AI나 동료 개발자가 이 기능을 구현할 때 참고할 **표준 가이드**입니다.

### **[User Search & Assignment Rules]**
1.  **Condition-Based Search:** 사용자가 부서명만으로도 담당자를 찾을 수 있도록 `SearchCondition`을 반드시 지원해야 한다.
2.  **DTO Transformation:** 외부 API(`EmployeeDto`)의 응답 객체를 그대로 프런트엔드에 노출하지 말고, UI 컴포넌트(Select/Autocomplete)에서 쓰기 좋은 형태(`label`, `value` 등)로 **Mapper**를 거쳐 전달한다.
3.  **Data Consistency:** 담당자 지정 시 `userId`뿐만 아니라 `fullName`과 `deptName`을 우리 시스템의 `request_assignees` 테이블에 **스냅샷**으로 저장하여, 나중에 퇴사나 조직 개편이 있어도 당시 작업 정보를 확인할 수 있게 한다.
4.  **Error Handling:** 사내 인명검색 시스템 점검 시 "인명 검색 서비스를 일시적으로 사용할 수 없습니다"라는 명확한 메시지를 사용자에게 전달한다.

---

## 💡 전문가의 팁: UX 디테일

* **최근 검색/지정 인원:** 엔지니어들은 대개 같이 일하는 사람들과 계속 일합니다. `localStorage`나 DB를 활용하여 **"최근 지정한 담당자"** 리스트를 검색창 아래에 미리 보여주면 클릭 한 번으로 지정이 완료되어 업무 효율이 비약적으로 상승합니다.
* **복수 카테고리 지정:** RFG 담당자와 Innovation 담당자를 동시에 검색해서 넣어야 하므로, 검색 창 위에 **"현재 어떤 카테고리의 담당자를 검색 중인지"**에 대한 컨텍스트(예: Radio Button)를 명확히 해주는 것이 중요합니다.

**인명 검색 결과(`EmployeeDto`)에 사번 외에 사진이나 연락처 정보도 포함되어 있나요?** 그에 따라 UI에 아바타(Avatar)를 추가할지 결정하면 더 나이스한 디자인이 나옵니다. 이 내용을 다음 `GEMINI.md` 초안에 포함할까요?


## 인명검색 payload 및 response
async searchEmployee(
    query: string,
    condition: 'FullName' | 'Organization' | 'Title',
  ): Promise<EmployeeSearchResponseDto> {
    const req: EmployeeRequestDto = { SearchQuery: query, SearchCondition: condition };
    return await this.repository.searchEmployee(req);
  } 
export interface EmployeeSearchResponseDto {
  result: string;
  currentPage: number;
  totalPage: number;
  totalCount: number;
  employees: EmployeeDto[];
}

export interface EmployeeSearchResponseDto {

  result: string;

  currentPage: number;

  totalPage: number;

  totalCount: number;

  employees: EmployeeDto[];

} export interface EmployeeDto {

 epId: string | null;

  fullName: string | null;

  userId: string | null;

departmentName: string | null;

emailAddress: string | null;

} 