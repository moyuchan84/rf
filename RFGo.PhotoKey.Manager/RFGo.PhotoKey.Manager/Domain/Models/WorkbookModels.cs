using System;
using System.Collections.Generic;

namespace RFGo.PhotoKey.Manager.Domain.Models
{
    public class WorkbookData
    {
        public WorkbookMeta Meta { get; set; } = new WorkbookMeta();
        public List<WorksheetData> Worksheets { get; set; } = new List<WorksheetData>();
        // 전역 설정은 DB 컬럼에 이미 저장되므로 JSON 내부에서는 선택적으로 관리
        public Dictionary<string, object> Config { get; set; } = new Dictionary<string, object>();
    }

    public class WorkbookMeta
    {
        public string FileName { get; set; }
        public string FullPath { get; set; }
        public DateTime LastModified { get; set; }
    }

    public class WorksheetData
    {
        public string SheetName { get; set; }
        public string SheetType { get; set; } // HISTORY, DATA
        public string PhotoCategory { get; set; } // key, info
        public OriginCoord Origin { get; set; } = new OriginCoord(); // UsedRange Origin
        public OriginCoord MetaOrigin { get; set; } = new OriginCoord(); // Metadata start
        public OriginCoord DataOrigin { get; set; } = new OriginCoord(); // Table start
        public Dictionary<string, string> MetaInfo { get; set; } = new Dictionary<string, string>();
        
        // 컬럼 순서를 보장하기 위한 리스트
        public List<ColumnDefinition> Columns { get; set; } = new List<ColumnDefinition>();
        
        // 빠른 조회를 위해 단순 Object Dictionary로 복구
        public List<Dictionary<string, object>> TableData { get; set; } = new List<Dictionary<string, object>>();
        
        // 시트 전체의 스타일/포맷 정보를 담는 스냅샷 (Binary/Base64)
        public string StyleBundle { get; set; }
    }

    public class CellValue
    {
        public object Value { get; set; }
        public string Style { get; set; }
    }

    public class ColumnDefinition
    {
        public string Key { get; set; }      // alias_col_0, alias_col_1...
        public string Name { get; set; }     // 원본 엑셀 헤더명
        public int Index { get; set; }       // 엑셀에서의 상대적 컬럼 인덱스
    }

    public class OriginCoord
    {
        public int Row { get; set; }
        public int Col { get; set; }
    }
}
