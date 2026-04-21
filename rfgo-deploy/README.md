# RFGo Deployment System (Helm Multi-Source)

이 저장소는 RFGo 시스템의 모든 마이크로서비스 배포 및 GitOps 설정을 관리합니다. Argo CD 2.6+의 **Helm Multi-Source** 기능을 기반으로 설계되어, 공통 템플릿과 환경별 설정을 안전하고 효율적으로 분리하여 관리합니다.

## 📂 저장소 구조 및 파일 역할

```text
rfgo-deploy/
├── charts/
│   ├── rfgo-service/          # [핵심] 모든 서비스(NestJS, FastAPI, React 등)가 공유하는 공통 Chart
│   └── rfgo-redis/            # Redis 인프라 전용 Chart
├── values/
│   ├── env/                   # [환경별 설정] 테넌트/인프라 환경 고유 설정
│   │   ├── local.yaml         # 로컬 개발용 (minikube/docker-compose)
│   │   ├── dev.yaml           # 사내 refgo-dev 테넌트 (테스트용)
│   │   └── prod.yaml          # 사내 refgo-prod 테넌트 (운영용 - Wildcard SSL 적용)
│   └── services/              # [서비스별 설정] 각 마이크로서비스 고유 매개변수
│       ├── nestjs.yaml        # 포트 3000, DB URL, SSO 설정
│       ├── fastapi.yaml       # 포트 8000, Redis 연동
│       ├── react.yaml         # 포트 80, API 엔드포인트
│       ├── embedding.yaml     # Worker 전용 설정 (Ingress 비활성)
│       ├── rag.yaml           # RAG 백엔드 전용
│       └── redis.yaml         # Redis 메모리 및 이미지 설정
├── argocd/
│   └── apps/                  # Argo CD Application 선언부 (Multi-Source 예시)
└── README.md                  # 시스템 통합 가이드
```

---

## 🚀 사내망(refgo Org) 설정 가이드

### 1. 인프라 정보
*   **Organization**: `refgo`
*   **Target Namespaces**: `refgo-dev` (개발/검증), `refgo-prod` (운영)
*   **Harbor Registry**: `harbor.foundrymtc.samsungds.net/refgo/...`
*   **Wildcard DNS**: `*.swsol.samsungds.net`
*   **ARC Runner**: `arc-runner-set` (Namespace: `arc-org-refgo`)

### 2. 사전 필수 작업 (Secret 생성)
각 테넌트 네임스페이스(`refgo-dev`, `refgo-prod`)에 보안 리소스를 먼저 생성해야 배포가 성공합니다.

```bash
# DB 접속 정보 (env/prod.yaml에서 참조)
kubectl create secret generic rfgo-db-credentials \
  --from-literal=DB_USER=adminuser \
  --from-literal=DB_PASSWORD=your_password \
  -n refgo-prod

# Wildcard 인증서 (*.swsol.samsungds.net)
kubectl create secret tls rfgo-wildcard-tls \
  --cert=wildcard.crt \
  --key=wildcard.key \
  -n refgo-prod
```

---

## 🛠️ Helm Multi-Source 배포 메커니즘

이 방식은 공통 템플릿(Chart) 1개와 다수의 설정파일(Values)을 Argo CD가 배포 시점에 병합(Merge)합니다.

### Argo CD 설정 구조 (예: NestJS 서비스)
Argo CD Application 생성 시 `sources`를 아래와 같이 정의합니다:
1.  **Source 1**: `path: charts/rfgo-service` (공통 템플릿 소스)
2.  **Source 2**: `ref: values-repo` (설정 파일 위치 소스)
3.  **Helm Option**: 
    *   `$values-repo/values/env/prod.yaml` (인프라 환경값 주입)
    *   `$values-repo/values/services/nestjs.yaml` (앱 서비스값 주입)

이 구조 덕분에 서비스가 10개로 늘어나도 `charts/`는 수정할 필요가 없으며, `values/services/`에 파일 1개만 추가하면 됩니다.

---

## 🐳 개별 프로젝트 Dockerfile 설정 (`Dockerfile.airtight`)

사내 폐쇄망 빌드를 위해 각 프로젝트(`rfgo-web-nestjs` 등)는 반드시 다음 규칙을 따라야 합니다.

### 권장 Base 이미지
*   **Python**: `harbor.foundrymtc.samsungds.net/library/python:3.13`
*   **Node.js**: `harbor.foundrymtc.samsungds.net/library/node:24`
*   **Nginx**: `harbor.foundrymtc.samsungds.net/library/nginx:1.24.0`

### 필수 포함 설정
폐쇄망 빌드 에러 방지를 위해 아래 설정을 Dockerfile 상단에 유지하세요:

1.  **Proxy & SSL**:
    ```dockerfile
    ARG HTTP_PROXY=http://proxy.internal.com:8080
    ENV http_proxy=$HTTP_PROXY
    ENV NODE_TLS_REJECT_UNAUTHORIZED=0
    ```
2.  **Private Registry (Nexus)**:
    *   **Node**: `npm config set registry https://nexus.internal.com/repository/npm-all/`
    *   **Python**: `pip config set global.index-url https://nexus.internal.com/repository/pypi-all/simple`
3.  **Prisma (NestJS)**:
    *   반드시 `npx prisma generate`를 빌드 단계에 포함하여 WASM 엔진 및 `linux-musl` 바이너리를 생성해야 합니다.

---

## 🔄 CI/CD 파이프라인 흐름
1.  개발자가 각 프로젝트 Repo에 Push.
2.  `arc-runner-set`이 `Dockerfile.airtight`를 읽어 빌드 후 Harbor에 푸시.
3.  GitHub Actions가 `rfgo-deploy/values/services/*.yaml`의 `tag` 값을 자동 업데이트.
4.  Argo CD가 변경을 감지하여 `refgo-prod` 네임스페이스의 컨테이너를 무중단 교체.
