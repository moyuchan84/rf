RFGo 시스템의 워크플로우를 완성하기 위한 DB 설계와 UI 전략, 그리고 시스템 연계 가이드를 제안해 드립니다.

1. DB 스키마 설계 브레인스토밍 (Extended Schema)
기존 request_items와 photo_keys를 중심으로, 워크플로우를 관리하기 위한 3개의 핵심 테이블을 추가하는 것을 추천합니다.

1) 의뢰 담당자 관리 (request_assignees)
인명 검색 API에서 가져온 정보를 저장하고 카테고리별(RFG, Innovation 등)로 복수 지정이 가능하게 합니다.

id: PK

request_id: FK (request_items.id)

category: String (예: 'RFG_TASK', 'KEY_TABLE_TASK')

user_id: String (사내 사번/계정)

user_name: String (디스플레이용 이름)

2) 작업 단계 상태 관리 (request_steps)
4단계 스탭의 진행 상황과 작업 내용을 저장합니다.

id: PK

request_id: FK

step_order: Integer (1~4)

step_name: String (ReferenceTable, KeyTableSetup, Submission, GDS)

status: String (TODO, IN_PROGRESS, DONE)

work_content: Text (RichText 데이터)

worker_id: String (최종 작업자)

completed_at: Timestamp

3) 의뢰별 참조/셋업 테이블 연결 (request_tables_map)
의뢰(Request)와 실제 데이터(PhotoKey)를 연결하는 중간 테이블입니다.

id: PK

request_id: FK

photo_key_id: FK (photo_keys.id)

type: String ('REFERENCE', 'SETUP')

2. UI Layout 및 Page 구성 아이디어
사용자 권한에 따라 화면이 유동적으로 변하는 "Task-Oriented Dashboard" 스타일을 제안합니다.

A. 의뢰 상세 및 워크플로우 뷰 (Main Page)
상단 (Header Summary): 제품 정보(Product Meta)와 현재 전체 진행률을 보여주는 Progress Bar.

중앙 (Visual Stepper): 1~4단계를 가로형 Stepper로 배치.

현재 단계는 Active 상태로 표시.

이전 단계가 DONE이 아니면 다음 단계는 비활성화(Disabled).

하단 (Contextual Content): Stepper에서 선택된 단계에 맞는 입력 폼 노출.

Step 1 (RFG): photo_keys에서 rfg_category별로 필터링된 테이블 리스트를 보여주고 체크박스로 Reference 지정.

Step 2 (Innov): Step 1에서 지정된 리스트를 보여주며, VSTO를 통해 업로드된 신규 Setup 테이블을 매핑.

B. 관리자/담당자 지정 모달
사내 인명검색 API와 연동된 검색창.

선택된 인원을 '카테고리 칩(Chip)' 형태로 표시 (예: [RFG] 홍길동 X, [Innov] 김철수 X).

3. 사내 시스템 연계 가이드 (FE vs BE)
결론부터 말씀드리면, 모든 시스템 연계(메일링, 인명검색, 결재)는 Backend(NestJS)에서 처리하는 것이 강력히 권장됩니다.

왜 Backend에서 호출해야 하는가?
보안 (Security): 사내 시스템 연계에 필요한 API Key나 인증 토큰을 Frontend에 노출하지 않아도 됩니다.

트랜잭션 및 로직 통합: 예를 들어 '결재 상신' 버튼 클릭 시, DB 상태 업데이트와 결재 API 호출이 한 번의 비즈니스 로직 안에서 완결되어야 데이터 무결성이 보장됩니다.

CORS 이슈 회피: 사내 시스템이 특정 서버 IP만 허용하는 경우가 많으므로 백엔드 경유가 필수적입니다.

추상화: Frontend는 우리 시스템의 API만 바라보고, 외부 시스템이 바뀌더라도 Backend의 어댑터 로직만 수정하면 됩니다.

4. GEMINI.md 작성을 위한 가이드라인
나중에 GEMINI.md를 생성할 때 다음 기술적 가이드를 포함하세요.

[Guide 1: External System Integration]
Infrastructure Layer: 외부 API 호출을 담당하는 MailingClient, ApprovalClient, UserSearchClient를 별도의 Provider로 구현할 것.

Axios/HttpModule: NestJS의 HttpModule을 사용하여 타임아웃 및 재시도 로직을 포함할 것.

[Guide 2: Workflow Guard & Logic]
State Transition: 다음 단계로 넘어가기 전 request_steps 테이블의 이전 단계 status가 'DONE'인지 확인하는 Validation 로직을 Service 레이어에 포함할 것.

Permission: PhotoKey.rfg_category에 따라 해당 권한(RFG/Inno)을 가진 담당자만 Update API를 호출할 수 있도록 GraphQL Shield 또는 NestJS Guard 적용.

[Guide 3: Mailing Trigger]
의뢰 생성 시 request_assignees와 requester_id를 기반으로 수신자 리스트를 동적으로 구성하여 백엔드에서 비동기(Queue 권장)로 메일을 발송할 것.