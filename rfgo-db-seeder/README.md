# RFGo Database Mockup Seeder

DB에 테스트용 데이터를 자동으로 삽입하는 도구입니다.

## 설정 및 실행 방법

1. **가상환경 생성 및 활성화**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

2. **패키지 설치**
   ```bash
   pip install -r requirements.txt
   ```

3. **환경 변수 확인**
   - `.env` 파일의 `DATABASE_URL` 또는 각 항목이 실제 DB 설정과 맞는지 확인합니다.

4. **시딩 실행**
   ```bash
   python seed.py
   ```

## 확장 방법
- `seed.py` 파일 내에 새로운 모델 클래스를 정의하고, `seed_xxx` 함수를 추가하여 호출하면 다른 테이블의 데이터도 쉽게 추가할 수 있습니다.
