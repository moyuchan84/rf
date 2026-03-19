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

            // 1. 전체 스타일 스냅샷
            data.StyleBundle = _styleSerializer.SerializeStyle(usedRange);

            // 2. "진짜" 데이터 시작점(Anchor) 찾기
            int absoluteStartRow = -1;
            int absoluteStartCol = -1;
            int headerRow = -1;

            for (int r = startRow; r <= Math.Min(startRow + 200, lastRow); r++)
            {
                for (int c = startCol; c <= lastCol; c++)
                {
                    string val = sheet.Cells[r, c].Value2?.ToString();
                    if (!string.IsNullOrEmpty(val))
                    {
                        if (absoluteStartRow == -1)
                        {
                            absoluteStartRow = r;
                            absoluteStartCol = c;
                        }

                        if (val.Trim().StartsWith(";"))
                        {
                            headerRow = r;
                            goto HeaderFound;
                        }
                    }
                }
            }

        HeaderFound:
            if (headerRow == -1) headerRow = absoluteStartRow != -1 ? absoluteStartRow : startRow;
            if (absoluteStartRow == -1) absoluteStartRow = startRow;
            if (absoluteStartCol == -1) absoluteStartCol = startCol;

            data.Origin.Row = absoluteStartRow;
            data.Origin.Col = absoluteStartCol;
            data.DataOrigin.Row = headerRow;
            data.DataOrigin.Col = absoluteStartCol;

            // 3. 메타정보 추출 (DATA 시트인 경우만 실행)
            bool metaOriginSet = false;
            if (data.SheetType == "DATA")
            {
                for (int r = absoluteStartRow; r < headerRow; r++)
                {
                    for (int c = absoluteStartCol; c <= lastCol; c++)
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
            }

            data.PhotoCategory = data.MetaInfo.Count > 0 ? "key" : "info";

            // 4. 컬럼 에일리어싱 (중복 방지)
            data.Columns.Clear();
            for (int j = absoluteStartCol; j <= lastCol; j++)
            {
                string originalHeader = sheet.Cells[headerRow, j].Value2?.ToString() ?? "";
                data.Columns.Add(new ColumnDefinition 
                { 
                    Key = $"col_{j - absoluteStartCol}", 
                    Name = originalHeader, 
                    Index = j - absoluteStartCol 
                });
            }

            // 5. 데이터 파싱 (에일리어싱 키 기준)
            for (int i = headerRow + 1; i <= lastRow; i++)
            {
                var row = new Dictionary<string, object>();
                bool hasData = false;
                foreach (var colDef in data.Columns)
                {
                    var cellVal = sheet.Cells[i, absoluteStartCol + colDef.Index].Value2;
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

            // 헤더 복원 (보존된 Name 사용)
            foreach (var col in data.Columns)
            {
                sheet.Cells[headerRow, tableStartCol + col.Index].Value2 = col.Name;
            }

            // 데이터 복원 (에일리어싱된 Key 기준 매핑)
            int dataStartRow = headerRow + 1;
            for (int i = 0; i < data.TableData.Count; i++)
            {
                var rowData = data.TableData[i];
                foreach (var col in data.Columns)
                {
                    if (rowData.ContainsKey(col.Key))
                    {
                        sheet.Cells[dataStartRow + i, tableStartCol + col.Index].Value2 = rowData[col.Key];
                    }
                }
            }
        }
    }
}
