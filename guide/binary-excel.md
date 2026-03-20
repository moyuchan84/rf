제안하신 **Dual Storage(Binary + JSON)** 전략은 실무에서 데이터 활용성과 원본 보존성을 모두 잡는 가장 영리한 방법입니다.

요청하신 대로 **VSTO(C#)에서의 전송**, **FastAPI(Python)에서의 저장**, 그리고 **NestJS + GraphQL에서의 복원 및 다운로드** 과정을 집대성한 `GEMINI.md` 파일을 생성해 드립니다.

---

# 📑 GEMINI.md: Excel Dual Storage System

본 문서는 **Nasca DRM** 환경에서 엑셀의 원본 복원(Binary)과 데이터 활용(JSON/RAG)을 동시에 충족하기 위한 하이브리드 저장 및 복원 가이드를 다룹니다.

## 🏗️ 시스템 아키텍처


1. **Producer (VSTO)**: 엑셀 파일을 열어 데이터를 추출(JSON)하고 원본(Binary)을 Base64로 인코딩하여 전송합니다.
2. **Storage (FastAPI + PostgreSQL)**: 수신된 데이터를 `BYTEA`(Binary)와 `JSONB`(Parsed) 컬럼에 각각 저장합니다.
3. **Consumer (NestJS + GraphQL)**: 사용자의 요청에 따라 DB에서 바이너리를 읽어 원본 파일로 복원하여 내려줍니다.

---

## 1. Producer: VSTO (C#) - 데이터 추출 및 전송
`WorkbooksLoaderHandler.cs`에서 파일을 읽어 FastAPI로 멀티파트 데이터를 전송합니다.

```csharp
// Application/Features/WorkbooksLoaderHandler.cs
public async Task<string> Execute(string payload)
{
    var paths = JsonConvert.DeserializeObject<List<string>>(payload);
    using (var client = new HttpClient())
    {
        foreach (var path in paths)
        {
            // 1. 원본 바이너리 읽기 (Nasca DRM 헤더 포함됨)
            byte[] fileBytes = File.ReadAllBytes(path);
            
            // 2. 데이터 파싱 (RAG/Display용)
            var parsedData = ParseToInternalJson(path); 

            // 3. Payload 구성
            var uploadDto = new {
                FileName = Path.GetFileName(path),
                BinaryContent = Convert.ToBase64String(fileBytes),
                JsonContent = parsedData,
                Uploader = "Se-ung"
            };

            var content = new StringContent(JsonConvert.SerializeObject(uploadDto), Encoding.UTF8, "application/json");
            await client.PostAsync("https://api.rfgo.local/v1/excel/upload", content);
        }
    }
    return "{\"status\":\"success\"}";
}
```

---

## 2. Storage: FastAPI (Python) - Dual 저장 로직
PostgreSQL의 `JSONB`와 `BYTEA` 타입을 활용하여 저장 효율을 극대화합니다.

```python
# main.py (FastAPI + SQLAlchemy)
from sqlalchemy.dialects.postgresql import JSONB, BYTEA

class ExcelDocument(Base):
    __tablename__ = "excel_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String)
    raw_binary = Column(BYTEA)    # 원본 복원용 (BSON)
    parsed_json = Column(JSONB)   # 웹 표시 및 RAG용
    created_at = Column(DateTime, default=func.now())

@app.post("/v1/excel/upload")
async def save_excel_dual(data: ExcelUploadSchema, db: Session = Depends(get_db)):
    # Base64 디코딩 후 바이너리로 저장
    binary_data = base64.b64decode(data.BinaryContent)
    
    new_doc = ExcelDocument(
        file_name=data.FileName,
        raw_binary=binary_data,
        parsed_json=data.JsonContent
    )
    db.add(new_doc)
    db.commit()
    return {"status": "stored"}
```

---

## 3. Consumer: NestJS (GraphQL) - 복원 및 다운로드
NestJS에서는 GraphQL 쿼리로 메타데이터를 제공하고, 실제 파일 다운로드는 전용 Controller를 통해 스트리밍합니다.

### A. GraphQL Schema & Service
```typescript
// excel.service.ts
@Injectable()
export class ExcelService {
  constructor(@InjectRepository(ExcelDocument) private repo: Repository<ExcelDocument>) {}

  async getFileBinary(id: string): Promise<ExcelDocument> {
    return await this.repo.findOne({ where: { id }, select: ['raw_binary', 'file_name'] });
  }
}
```

### B. Download Controller (Rest API 연동)
GraphQL은 바이너리 전송에 적합하지 않으므로, 다운로드는 REST 엔드포인트를 사용합니다.

```typescript
// excel.controller.ts
@Controller('download')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get(':id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.excelService.getFileBinary(id);
    
    // DB의 BYTEA(Buffer)를 파일로 응답
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.file_name)}"`,
      'Content-Length': doc.raw_binary.length,
    });

    res.end(doc.raw_binary);
  }
}
```

---

## 4. 핵심 장점 요약
1. **완벽한 복구**: `BYTEA`에 저장된 바이너리는 Nasca DRM 정보를 그대로 포함하므로, 다운로드 후 사내 PC에서 열 때 아무런 문제가 없습니다.
2. **AI 친화적**: `JSONB` 컬럼은 별도의 복호화 없이 NestJS나 Python에서 바로 읽어 **RAG(Retrieval-Augmented Generation)** 데이터셋으로 즉시 투입 가능합니다.
3. **성능 최적화**: 웹에서 리스트를 보여줄 때는 `raw_binary`를 제외하고 조회하여 트래픽을 아낍니다.

---

### 💡 향후 확장 제안
* **Vector Search**: `JSONB` 데이터를 바탕으로 임베딩을 생성하여 `pgvector` 컬럼에 저장하면, 자연어 기반 엑셀 내용 검색 기능 구현이 가능합니다.
* **Stream 처리**: 파일 용량이 50MB를 초과할 경우, 메모리 점유율을 낮추기 위해 `Stream` 방식으로 업로드/다운로드하는 로직을 추가하는 것을 권장합니다.

---

**이 가이드가 프로젝트 완성에 도움이 되길 바랍니다.** 다음 단계로 **NestJS에서 pgvector를 연동하여 실제 RAG 기능을 구현하는 방법**이 궁금하신가요?