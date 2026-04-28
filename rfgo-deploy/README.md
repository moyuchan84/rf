# RFGo Deployment System (ArgoCD ApplicationSet)

이 저장소는 RFGo 시스템의 모든 마이크로서비스 배포 및 GitOps 설정을 관리합니다. 
ArgoCD의 **ApplicationSet (Matrix Generator)** 기능을 사용하여, 다수의 서비스와 멀티 환경(Dev/Prod) 배포를 자동화합니다.

---

## 📂 저장소 구조 및 역할

```text
rfgo-deploy/
├── charts/
│   ├── rfgo-service/          # [템플릿] 모든 서비스(React, NestJS 등)가 공유하는 공통 Helm Chart
│   └── rfgo-redis/            # [템플릿] Redis 전용 Helm Chart
├── values/
│   ├── env/                   # [환경 인프라] dev.yaml, prod.yaml (도메인, DB IP, 리소스 할당량 등)
│   └── services/              # [서비스 설정] 
│       ├── common/            # 이미지 레포지토리, 서비스 포트 등 공통값
│       ├── dev/               # 개발 환경용 Tag(latest), 개발용 Host명, 로그 레벨(debug)
│       └── prod/              # 운영 환경용 Tag(stable), 운영용 Host명, 로그 레벨(info)
├── argocd/
│   ├── install/               # ArgoCD 프로젝트(AppProject) 정의
│   └── infra/                 # [핵심] rfgo-appset.yaml (모든 앱을 자동 생성하는 마스터 설정)
└── README.md
```

---

## 🚀 배포 메커니즘: Matrix Generator

이 저장소는 **"Matrix Generator"** 방식을 사용하여 12개의 앱을 자동으로 관리합니다.

### 1. 자동 생성 공식
ArgoCD가 아래의 두 축을 곱하여(Matrix) Application을 자동으로 생성합니다.
*   **환경 축 (2)**: `dev`, `prod`
*   **서비스 축 (6)**: `react`, `nestjs`, `fastapi`, `rag`, `embedding`, `redis`
*   **결과**: `rfgo-react-dev`, `rfgo-react-prod`, ... 총 12개 앱 자동 생성

### 2. Value 파일 병합 순서 (Overlays)
하나의 앱이 배포될 때 ArgoCD는 아래 순서로 설정파일을 겹쳐서(Merge) 최종 설정을 만듭니다.
1.  `values/env/{{env}}.yaml`: 환경별 인프라 기본값 (예: 도메인 접미사)
2.  `values/services/common/{{service}}.yaml`: 서비스별 공통값 (예: 컨테이너 포트)
3.  `values/services/{{env}}/{{service}}.yaml`: **최종 오버라이드** (예: 현재 배포할 이미지 Tag)

---

## 🔄 CI/CD 워크플로우 (개발자 가이드)

개발자가 코드를 수정하고 푸시하면 배포까지 다음의 과정이 자동으로 일어납니다.

1.  **빌드 (CI)**: GitHub Actions가 소스를 빌드하여 Harbor에 푸시합니다.
    *   `develop` 브랜치 -> `dev-` 태그 생성
    *   `main` 브랜치 -> `prod-` 태그 생성
2.  **버전 업데이트**: CI 워크플로우가 본 저장소(`rfgo-deploy`)의 해당 환경 파일을 업데이트합니다.
    *   개발 배포 시: `values/services/dev/{{service}}.yaml` 의 `tag` 값 수정
    *   운영 배포 시: `values/services/prod/{{service}}.yaml` 의 `tag` 값 수정
3.  **동기화 (CD)**: ArgoCD의 `ApplicationSet`이 파일 변경을 감지하고, 해당 환경의 쿠버네티스 포드(Pod)를 새 버전으로 교체합니다.

---

## 🛠️ ArgoCD 초기 설정 방법 (운영자)

새로운 클러스터에 RFGo 시스템을 처음 설치할 때 다음 순서로 진행합니다.

1.  **Project 등록**: `argocd/install/project.yaml`을 먼저 배포합니다.
2.  **AppSet 등록**: ArgoCD UI에서 `New App` 클릭 후 아래와 같이 입력합니다.
    *   **Application Name**: `rfgo-root-appset`
    *   **Project**: `default` (Root 관리용)
    *   **Repository URL**: 본 저장소 주소
    *   **Path**: `argocd/infra` (rfgo-appset.yaml이 있는 곳)
3.  **확인**: `rfgo-root-appset`이 생성되면, 잠시 후 UI에 `rfgo-react-dev` 등 12개의 자식 앱이 자동으로 나타나는지 확인합니다.

---

## 🐳 사내망 빌드 규칙 (Airtight)
모든 Docker 빌드는 `harbor.foundrymtc.samsungds.net` 내의 승인된 Base 이미지만 사용해야 하며, 사내 Nexus 리포지토리를 통해 패키지를 설치해야 합니다. 상세 설정은 각 프로젝트의 `Dockerfile.airtight`를 참조하세요.
