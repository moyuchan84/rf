# 🛠️ RFGo System: User Management & Admin Guide

이 문서는 시스템 관리자(ADMIN)가 사용자 권한을 관리하고 시스템 접근 제어를 수행하는 방법에 대해 설명합니다.

## 1. 개요

RFGo 시스템은 Role-Based Access Control (RBAC)을 기반으로 동작합니다. 모든 사용자는 시스템 접속 시 기본적으로 `USER` 권한을 부여받으며, 관리자는 '사용자 관리' 메뉴를 통해 각 사용자의 역할을 변경할 수 있습니다.

## 2. 주요 역할 (Roles)

| 역할 | 명칭 | 주요 권한 |
|:---:|:---:|:---|
| **ADMIN** | 관리자 | 모든 데이터 접근, 사용자 권한 관리, 시스템 설정 변경 |
| **RFG** | RFG 담당자 | 기준 정보(Photo Key) 관리, Reference Table 지정 권한 |
| **INNO** | Innovation 담당자 | 디자인 룰 및 키 디자인 가이드 관리 |
| **USER** | 일반 사용자 | 의뢰 생성, 조회 및 본인 담당 단계 작업 수행 |

## 3. 사용자 관리 기능

### 3.1 사용자 목록 조회
- 시스템에 한 번이라도 접속한 적이 있는 모든 사용자의 목록을 확인합니다.
- 성명, Knox ID, 이메일, 소속 부서 정보를 포함합니다.

### 3.2 권한 변경
- 관리자는 각 사용자 옆의 드롭다운 메뉴를 통해 역할을 즉시 변경할 수 있습니다.
- 변경사항은 실시간으로 DB에 반영되며, 해당 사용자의 다음 요청부터 새로운 권한이 적용됩니다.

## 4. 구현 세부 사항

### 4.1 Backend (NestJS)
- **Resolver**: `UserManagementResolver` (`@Roles(RoleName.ADMIN)` 가드 적용)
- **Service**: `AuthService` 내 `findAllUsers`, `findAllRoles`, `updateUserRole` 메서드
- **Security**: `RolesGuard`를 통해 API 레벨에서 Admin 권한 검증 수행

### 4.2 Frontend (React)
- **Page**: `/admin/users` (`UserManagement.tsx`)
- **Components**: `PermissionGate`를 사용하여 관리자 전용 UI 노출 제어
- **Navigation**: Sidebar 하단에 '사용자 관리' 메뉴 제공 (Admin 전용)

## 5. 관리자 유의사항

1. **최초 관리자 설정**: 시스템 초기 구축 시 DB에서 특정 사용자의 `roleId`를 직접 `ADMIN`에 해당하는 ID로 업데이트해야 합니다.
2. **권한 동기화**: 역할 변경 후 사용자가 현재 페이지에서 즉시 변경된 권한을 체감하지 못할 경우, 페이지 새로고침을 권장합니다.
3. **접근 제어**: 모든 민감한 API 요청은 서버 측에서 이중으로 권한을 검증하므로, Frontend UI 제어는 사용자 편의성 제공을 목적으로 합니다.
