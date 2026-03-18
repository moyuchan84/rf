using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MSExcel = Microsoft.Office.Interop.Excel;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;

namespace RFGo.PhotoKey.Manager.Infrastructure.Excel
{
    public class WorkbookService : IWorkbookService
    {
        private readonly IExcelStyleService _styleSerializer = new ExcelStyleSerializer();

        public List<WorkbookMeta> GetExcelFilesFromDirectory(string directoryPath)
        {
            if (!Directory.Exists(directoryPath)) return new List<WorkbookMeta>();
            var files = Directory.GetFiles(directoryPath, "*.xlsx");
            return files.Select(f => new WorkbookMeta
            {
                FileName = Path.GetFileName(f),
                FullPath = f,
                LastModified = File.GetLastWriteTime(f)
            }).ToList();
        }

        public WorkbookData ParseWorkbook(string filePath)
        {
            MSExcel.Application excelApp = new MSExcel.Application();
            MSExcel.Workbook workbook = null;
            var workbookData = new WorkbookData();

            try
            {
                workbook = excelApp.Workbooks.Open(filePath);
                workbookData.Meta.FileName = Path.GetFileName(filePath);
                workbookData.Meta.FullPath = filePath;

                // Suggested logic: 2nd sheet name as table name
                if (workbook.Sheets.Count >= 2)
                {
                    MSExcel.Worksheet secondSheet = workbook.Sheets[2] as MSExcel.Worksheet;
                    workbookData.Meta.SuggestedTableName = secondSheet?.Name;
                }

                // Parse revision from filename
                workbookData.Meta.Revision = ExtractRevisionFromPath(filePath);

                for (int i = 1; i <= workbook.Sheets.Count; i++)
                {
                    MSExcel.Worksheet sheet = workbook.Sheets[i] as MSExcel.Worksheet;
                    if (sheet != null)
                    {
                        workbookData.Worksheets.Add(ParseWorksheet(sheet, i));
                    }
                }
            }
            finally
            {
                workbook?.Close(false);
                excelApp.Quit();
                System.Runtime.InteropServices.Marshal.ReleaseComObject(excelApp);
            }

            return workbookData;
        }

        private int ExtractRevisionFromPath(string path)
        {
            try
            {
                string fileName = Path.GetFileName(path);
                // Look for _R{number}_ pattern
                var match = System.Text.RegularExpressions.Regex.Match(fileName, @"_R(\d+)_");
                if (match.Success && int.TryParse(match.Groups[1].Value, out int rev))
                {
                    return rev;
                }
            }
            catch { }
            return 1; // Default revision
        }

        private WorksheetData ParseWorksheet(MSExcel.Worksheet sheet, int index)
        {
            var data = new WorksheetData
            {
                SheetName = sheet.Name,
                SheetType = (index == 1) ? "HISTORY" : "DATA"
            };

            MSExcel.Range usedRange = sheet.UsedRange;
            if (usedRange == null || usedRange.Cells.Count == 0) return data;

            // 핵심 수정: Origin을 UsedRange의 시작점(좌상단)으로 설정하여 
            // 전체 시트 데이터(Meta + Table)의 상대적 위치를 보존함.
            data.Origin.Row = usedRange.Row;
            data.Origin.Col = usedRange.Column;

            ProcessDataSheet(sheet, data);
            
            return data;
        }

        private void ProcessDataSheet(MSExcel.Worksheet sheet, WorksheetData data)
        {
            MSExcel.Range usedRange = sheet.UsedRange;
            int startRow = usedRange.Row;
            int startCol = usedRange.Column;
            int lastCol = usedRange.Columns.Count + startCol - 1;
            int lastRow = usedRange.Rows.Count + startRow - 1;

            // 1. 전체 스타일 스냅샷 (복원 시 기본 틀로 사용)
            data.StyleBundle = _styleSerializer.SerializeStyle(usedRange);

            // 2. 헤더 행 및 DataOrigin 찾기
            int headerRow = -1;
            int scanLimit = Math.Min(startRow + 100, lastRow);
            for (int r = startRow; r <= scanLimit; r++)
            {
                for (int c = startCol; c <= lastCol; c++)
                {
                    string val = sheet.Cells[r, c].Value2?.ToString();
                    if (val != null && val.Trim().StartsWith(";"))
                    {
                        headerRow = r;
                        break;
                    }
                }
                if (headerRow != -1) break;
            }

            if (headerRow == -1) headerRow = startRow;

            // 테이블 데이터 시작 좌표 저장 (UsedRange의 왼쪽 끝 열을 기준으로 너비 전체 파싱)
            data.DataOrigin.Row = headerRow;
            data.DataOrigin.Col = startCol; 

            // 3. 메타정보 수집 및 MetaOrigin 설정
            bool metaOriginSet = false;
            for (int r = startRow; r < headerRow; r++)
            {
                for (int c = startCol; c <= lastCol; c++)
                {
                    string val = sheet.Cells[r, c].Value2?.ToString();
                    if (!string.IsNullOrEmpty(val))
                    {
                        if (!metaOriginSet)
                        {
                            data.MetaOrigin.Row = r;
                            data.MetaOrigin.Col = c;
                            metaOriginSet = true;
                        }

                        if (val.Contains(":"))
                        {
                            var split = val.Split(':');
                            string k = split[0].Trim();
                            if (!data.MetaInfo.ContainsKey(k))
                                data.MetaInfo[k] = split.Length > 1 ? split[1].Trim() : "";
                        }
                        else
                        {
                            string key = $"#{data.MetaInfo.Count + 1}";
                            data.MetaInfo[key] = val;
                        }
                    }
                }
            }

            data.PhotoCategory = data.MetaInfo.Count > 0 ? "key" : "info";

            // 4. 컬럼 정의 (원본 이름 그대로 보존, empty 포함, ';' 포함)
            data.Columns.Clear();
            for (int j = startCol; j <= lastCol; j++)
            {
                string header = sheet.Cells[headerRow, j].Value2?.ToString() ?? "";
                
                // 억지로 이름을 지어내지 않고 원본 그대로(빈 문자열 포함) 저장
                // ';' 도 지우지 않고 그대로 유지함.
                data.Columns.Add(new ColumnDefinition 
                { 
                    Key = $"col_{j - startCol}", 
                    Name = header, 
                    Index = j - startCol 
                });
            }

            // 5. 데이터 파싱
            for (int i = headerRow + 1; i <= lastRow; i++)
            {
                var row = new Dictionary<string, object>();
                bool hasData = false;
                foreach (var colDef in data.Columns)
                {
                    var cellVal = sheet.Cells[i, startCol + colDef.Index].Value2;
                    row[colDef.Key] = cellVal;
                    if (cellVal != null) hasData = true;
                }
                if (hasData) data.TableData.Add(row);
            }
        }

        public WorkbookData ParseActiveWorkbook()
        {
            MSExcel.Application excelApp = Globals.ThisAddIn.Application;
            MSExcel.Workbook workbook = excelApp.ActiveWorkbook;
            var workbookData = new WorkbookData();

            if (workbook == null) return workbookData;

            try
            {
                workbookData.Meta.FileName = workbook.Name;
                workbookData.Meta.FullPath = workbook.FullName;

                // Suggested logic: 2nd sheet name as table name
                if (workbook.Sheets.Count >= 2)
                {
                    MSExcel.Worksheet secondSheet = workbook.Sheets[2] as MSExcel.Worksheet;
                    workbookData.Meta.SuggestedTableName = secondSheet?.Name;
                }

                // Parse revision from filename
                workbookData.Meta.Revision = ExtractRevisionFromPath(workbook.FullName);

                for (int i = 1; i <= workbook.Sheets.Count; i++)
                {
                    MSExcel.Worksheet sheet = workbook.Sheets[i] as MSExcel.Worksheet;
                    if (sheet != null)
                    {
                        workbookData.Worksheets.Add(ParseWorksheet(sheet, i));
                    }
                }
            }
            catch (Exception) { }

            return workbookData;
        }

        public bool SaveToPreconfirmTable(WorkbookData data) => true;

        public bool RestoreToExcel(WorkbookData data, string targetFilePath)
        {
            MSExcel.Application excelApp = new MSExcel.Application();
            excelApp.DisplayAlerts = false; // 저장 중 팝업 방지
            MSExcel.Workbook workbook = excelApp.Workbooks.Add();

            try
            {
                for (int i = 0; i < data.Worksheets.Count; i++)
                {
                    var wsData = data.Worksheets[i];
                    MSExcel.Worksheet sheet;
                    if (i == 0) sheet = workbook.ActiveSheet as MSExcel.Worksheet;
                    else sheet = workbook.Sheets.Add(After: workbook.Sheets[workbook.Sheets.Count]) as MSExcel.Worksheet;

                    sheet.Name = wsData.SheetName;
                    RestoreWorksheet(sheet, wsData);
                }

                if (!string.IsNullOrEmpty(targetFilePath))
                {
                    workbook.SaveAs(targetFilePath);
                    workbook.Close();
                }
                else
                {
                    excelApp.Visible = true;
                }
            }
            catch (Exception)
            {
                return false;
            }
            finally
            {
                if (!string.IsNullOrEmpty(targetFilePath))
                {
                    excelApp.Quit();
                    System.Runtime.InteropServices.Marshal.ReleaseComObject(excelApp);
                }
            }
            return true;
        }

        public void RestoreWorkbooks(List<WorkbookData> workbooks)
        {
            foreach (var wb in workbooks)
            {
                RestoreToExcel(wb, null);
            }
        }

        private void RestoreWorksheet(MSExcel.Worksheet sheet, WorksheetData data)
        {
            // 1. 전체 스타일 스냅샷 일괄 복원
            if (!string.IsNullOrEmpty(data.StyleBundle))
            {
                int lastDataRow = Math.Max(data.DataOrigin.Row + data.TableData.Count + 10, data.Origin.Row + 100);
                int lastDataCol = data.DataOrigin.Col + data.Columns.Count + 5;
                MSExcel.Range targetRange = sheet.Range[sheet.Cells[data.Origin.Row, data.Origin.Col], sheet.Cells[lastDataRow, lastDataCol]];
                _styleSerializer.ApplyStyle(targetRange, data.StyleBundle);
            }

            // 2. MetaInfo 복원 (MetaOrigin 기준)
            if (data.MetaOrigin.Row > 0 && data.MetaOrigin.Col > 0)
            {
                int r = data.MetaOrigin.Row;
                int c = data.MetaOrigin.Col;
                foreach (var meta in data.MetaInfo)
                {
                    string output = meta.Key.StartsWith("#") ? meta.Value : $"{meta.Key}: {meta.Value}";
                    sheet.Cells[r, c].Value2 = output;
                    r++; 
                }
            }

            // 3. Data Table 복원 (DataOrigin 기준)
            int headerRow = data.DataOrigin.Row;
            int tableStartCol = data.DataOrigin.Col;

            for (int i = 0; i < data.Columns.Count; i++)
            {
                var col = data.Columns[i];
                sheet.Cells[headerRow, tableStartCol + i].Value2 = col.Name;
            }

            int dataStartRow = headerRow + 1;
            for (int i = 0; i < data.TableData.Count; i++)
            {
                var rowData = data.TableData[i];
                for (int j = 0; j < data.Columns.Count; j++)
                {
                    var col = data.Columns[j];
                    if (rowData.ContainsKey(col.Key))
                    {
                        sheet.Cells[dataStartRow + i, tableStartCol + j].Value2 = rowData[col.Key];
                    }
                }
            }
        }
    }
}
