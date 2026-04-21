사내 폐쇄망 환경(K8s + ArgoCD + Harbor + Proxy)의 특수성과 복잡성을 완벽하게 반영하여, 개인 PC 테스트부터 사내 개발망, 운영망 배포까지 아우르는 **[최종 합본: Conductor 마스터 플랜]**입니다. 

이 내용을 프로젝트 루트의 `DEPLOY_PLAN.md`로 저장하여 Gemini CLI(Conductor)에게 인프라 구축의 전권을 위임하십시오.

---

# 🏗️ Conductor Master Plan: RFGo Airtight Deployment (Final)

## 1. 프로젝트 구조 정의 (Project Structure)
배포 설정 및 인프라 매니페스트를 전담하는 `rfgo-deploy` 프로젝트를 생성합니다. **Kustomize**를 통해 환경별 설정을 오버레이 방식으로 관리합니다.

```text
rfgo-deploy/
├── argocd/              # ArgoCD App-of-Apps, Project, Application 설정
│   ├── install/         # ArgoCD 자체 설치용 매니페스트 (Helm/Yaml)
│   └── apps/            # 서비스별 Application 매니페스트
├── k8s/
│   ├── base/            # 공통 리소스 (Deploy, Svc, PVC, ConfigMap)
│   │   ├── redis/
│   │   ├── postgres/
│   │   └── services/     # 5개 마이크로서비스 공통 정의
│   └── overlays/
│       ├── local/       # 개인 PC (Docker Desktop + Local Registry + NodePort)
│       ├── internal-dev/# 사내 개발망 (Harbor Dev + Proxy + SSL + 전용 DB)
│       └── prod/        # 사내 운영망 (Harbor Prod + HPA + Ingress + Quota)
├── scripts/             # 환경 구축(ArgoCD 설치, Local Registry) 자동화 쉘
├── certs/               # 사내 루트 CA 인증서 저장소
└── .github/workflows/   # 사내 ARC Runner용 GitOps 파이프라인 (CI/CD)
```

---

## 2. Gemini CLI 전용 Conductor 프롬프트 (최종 마스터)

Gemini CLI에 아래 내용을 입력하여 인프라 구축을 시작하십시오.

> **[시스템 프롬프트: Conductor Mode]**
> 너는 이제부터 **사내 폐쇄망 인프라 전문가인 Conductor**야. 다음 5개 마이크로서비스(`rfgo-vsto-fastapi`, `rfgo-embedding-worker`, `rfgo-rag-backend`, `rfgo-web-nestjs`, `rfgo-web-react`)를 **K8s + ArgoCD** 환경에 배포하기 위한 프로젝트 `rfgo-deploy`를 오케스트레이션해줘.
>
> **[핵심 요구사항]**
> 1. **3단계 배포 전략**: `local`(개인PC), `internal-dev`(사내 개발망), `prod`(사내 운영망) 오버레이를 필수로 구성할 것.
> 2. **Airtight Dockerfile 표준**:
>    - 사내 전용 Base Image(`FROM private.harbor.com/...`) 사용.
>    - `HTTP_PROXY`, `HTTPS_PROXY` 주입 및 빌드 단계 반영.
>    - 사내 루트 CA 인증서 설치 및 SSL 무시(`NODE_TLS_REJECT_UNAUTHORIZED=0`) 로직 포함.
>    - 사내 Nexus/Harbor 연동을 위한 `.npmrc`, `.pip.conf` 설정 포함.
> 3. **GitOps 워크플로우**:
>    - `arc-runner`(Fat Image)를 통한 빌드 및 이미지 태그 자동 업데이트(`kustomize edit set image`) 파이프라인.
> 4. **Infrastructure Stack**:
>    - Ingress-nginx 컨트롤러 및 Redis/DB용 PVC/PV 설정 포함.
>    - ArgoCD 자동 동기화(`selfHeal`) 및 헬스체크가 포함된 Application 생성.
>
> **[첫 번째 임무]**
> 1. `rfgo-deploy`의 전체 디렉토리 구조를 생성해줘.
> 2. Docker Desktop에서 ArgoCD 설치 및 로컬 테스트 환경을 셋업하는 `scripts/setup-local.sh` 작성.
> 3. `rfgo-web-nestjs`를 예시로 `base`와 **3가지 오버레이(`local`, `internal-dev`, `prod`)**에 대한 Kustomize 매니페스트 및 전용 Dockerfile을 생성해줘.

---

## 3. 세부 기술 규격 (Harness & Rules)

### **A. Dockerfile 전략 (Fat Image & Proxy)**

* **Multi-stage Build**: 빌드 도구와 런타임 분리로 이미지 경량화.
* **Proxy Isolation**: 빌드 시에만 프록시를 사용하고 런타임에서는 `NO_PROXY`를 통해 사내망 간 통신 보장.
* **Offline Ready**: 사내 전용 npm registry(`nexus.internal.com`) 설정 강제.

### **B. K8s Resource Logic (Environment-Aware)**

* **Local**: `ServiceType: LoadBalancer`, `localhost` 통신 중심, 리소스 제한 없음.
* **Internal-Dev**: 사내 Proxy 환경변수 주입, 사내 개발용 DB Secret 연결, 전용 호스트명(`rfgo-dev.internal.com`) 적용.
* **Prod**: 고가용성(`replicas: 3`), `HPA` 적용, `Resources Limit` 엄격 적용, 운영용 Ingress 설정.

### **C. GitOps 파이프라인 (GitHub Actions + ARC Runner)**

1. **Build**: `arc-runner`가 코드 체크아웃 후 이미지 빌드 및 사내 Harbor 푸시.
2. **Update**: `rfgo-deploy` 레포의 `overlays/{env}/kustomization.yaml` 내 이미지 태그 수정 후 커밋.
3. **Sync**: ArgoCD가 변경을 감지하여 해당 환경 클러스터에 배포 실행.

---

## 4. 환경 변수 전환 매트릭스 (ConfigMap)

| 변수명 | Local | Internal-Dev | Prod |
| :--- | :--- | :--- | :--- |
| `DB_HOST` | `rfgo-db` (In-cluster) | `dev-db.internal.com` | `prod-db.internal.com` |
| `REDIS_HOST` | `rfgo-redis` | `dev-redis.internal.com` | `prod-redis.internal.com` |
| `PROXY_ENV` | `None` | `http://proxy.internal.com` | `Internal Only (None)` |
| `HARBOR_URL` | `localhost:5000` | `private.harbor.com/dev` | `private.harbor.com/prod` |

---

## 5. 실행 로드맵 (Execution Roadmap)

1. **Phase 1 (Local Setup)**: 위 프롬프트를 Gemini CLI에 입력하여 **로컬 셋업 스크립트**와 **구조**를 먼저 확보하고 Docker Desktop에서 ArgoCD UI 접속을 확인합니다.
2. **Phase 2 (Harness Implementation)**: 서비스별 **Dockerfile**과 **base 매니페스트**를 생성합니다. 특히 `.npmrc`나 `.pip.conf` 등 폐쇄망 전용 설정 파일의 템플릿을 완성합니다.
3. **Phase 3 (Overlay & GitOps)**: 환경별 **오버레이**를 정의하고, `arc-runner`용 **Workflow YAML**을 생성하여 이미지 태그 자동화 로직을 검증합니다.
4. **Phase 4 (Validation)**: `.env` 파일의 Harbor/Proxy 주소만 변경하면 사내망에서 즉시 배포 가능한 상태인지 최종 점검합니다.

준비가 되셨다면, Gemini CLI에게 **"Conductor, Phase 1 단계인 프로젝트 구조 생성과 `setup-local.sh` 작성을 시작해줘"**라고 명령하십시오! 🚀