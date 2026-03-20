using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows.Forms;
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
            excelApp.DisplayAlerts = false; // 경고 팝업 방지
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
                // 클립보드 비우기 시도 (혹시 남아있을 대용량 데이터 경고 방지)
                try { excelApp.CutCopyMode = (MSExcel.XlCutCopyMode)0; } catch { }
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
            if (usedRange == null) return;

            int startRow = usedRange.Row;
            int startCol = usedRange.Column;
            int lastCol = usedRange.Columns.Count + startCol - 1;
            int lastRow = usedRange.Rows.Count + startRow - 1;

            // 1. 스타일 스냅샷 (HTML Clipboard 방식)
            data.StyleBundle = CopyRangeStyleToHtml(usedRange);

            // 2. "진짜" 데이터 시작점(Anchor) 찾기
            int absoluteStartRow = -1;
            int absoluteStartCol = -1;
            bool anchorFound = false;

            for (int r = startRow; r <= lastRow && !anchorFound; r++)
            {
                for (int c = startCol; c <= lastCol; c++)
                {
                    if (sheet.Cells[r, c].Value2 != null)
                    {
                        absoluteStartRow = r;
                        absoluteStartCol = c;
                        anchorFound = true;
                        break;
                    }
                }
            }

            if (absoluteStartRow == -1) return;

            // 3. 데이터 형태 분석을 통한 헤더 행(headerRow) 식별
            // 규칙: 행에 데이터가 2개 이상 있는 첫 번째 행이 진짜 테이블 헤더임.
            int headerRow = -1;
            for (int r = absoluteStartRow; r <= lastRow; r++)
            {
                if (CountOccupiedInRow(sheet, r, startCol, lastCol) >= 2)
                {
                    headerRow = r;
                    break;
                }
            }

            if (headerRow == -1) headerRow = absoluteStartRow;

            // 좌표 확정
            data.Origin.Row = absoluteStartRow;
            data.Origin.Col = absoluteStartCol;
            data.DataOrigin.Row = headerRow;
            data.DataOrigin.Col = startCol; 

            // 4. 메타정보 추출 (Absolute Origin ~ HeaderRow - 1)
            bool metaOriginSet = false;
            if (data.SheetType == "DATA")
            {
                for (int r = absoluteStartRow; r < headerRow; r++)
                {
                    string val = sheet.Cells[r, absoluteStartCol].Value2?.ToString();
                    if (!string.IsNullOrEmpty(val))
                    {
                        if (!metaOriginSet)
                        {
                            data.MetaOrigin.Row = r;
                            data.MetaOrigin.Col = absoluteStartCol;
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

            // 5. 컬럼 정의 및 Aliasing (원본 이름 보존, ';' 유지)
            data.Columns.Clear();
            for (int j = startCol; j <= lastCol; j++)
            {
                string originalHeader = sheet.Cells[headerRow, j].Value2?.ToString() ?? "";
                data.Columns.Add(new ColumnDefinition 
                { 
                    Key = $"col_{j - startCol}", 
                    Name = originalHeader, 
                    Index = j - startCol 
                });
            }

            // 6. 데이터 행 파싱
            for (int i = headerRow + 1; i <= lastRow; i++)
            {
                var row = new Dictionary<string, object>();
                bool rowHasData = false;
                foreach (var colDef in data.Columns)
                {
                    var cellVal = sheet.Cells[i, startCol + colDef.Index].Value2;
                    row[colDef.Key] = cellVal;
                    if (cellVal != null) rowHasData = true;
                }
                if (rowHasData) data.TableData.Add(row);
            }
        }

        private int CountOccupiedInRow(MSExcel.Worksheet sheet, int row, int startCol, int lastCol)
        {
            int count = 0;
            for (int c = startCol; c <= lastCol; c++)
            {
                if (sheet.Cells[row, c].Value2 != null) count++;
            }
            return count;
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

                string finalSavePath = targetFilePath;
                if (!string.IsNullOrEmpty(targetFilePath) && !string.IsNullOrEmpty(data.Meta.FileName))
                {
                    // FileName 속성이 있으면 이를 우선 사용
                    string directory = Path.GetDirectoryName(targetFilePath);
                    if (string.IsNullOrEmpty(directory)) directory = ".";
                    
                    if (Directory.Exists(targetFilePath))
                    {
                        finalSavePath = Path.Combine(targetFilePath, data.Meta.FileName);
                    }
                    else
                    {
                        finalSavePath = Path.Combine(directory, data.Meta.FileName);
                    }
                }

                if (!string.IsNullOrEmpty(finalSavePath))
                {
                    workbook.SaveAs(finalSavePath);
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
                    // 클립보드 비우기
                    try { excelApp.CutCopyMode = (MSExcel.XlCutCopyMode)0; } catch { }
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
            // 1. 전체 스타일 및 내용 복원 (HTML Clipboard 방식 우선)
            if (!string.IsNullOrEmpty(data.StyleBundle))
            {
                MSExcel.Range targetRange = sheet.Cells[data.Origin.Row, data.Origin.Col];
                PasteStyleFromHtml(targetRange, data.StyleBundle);
                return; // HTML Clipboard로 복원 시 메타/테이블 데이터 복원은 생략 (원본 그대로 복원)
            }

            // Fallback: MetaInfo/TableData 기반 복원
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

            int headerRow = data.DataOrigin.Row;
            int tableStartCol = data.DataOrigin.Col;

            foreach (var col in data.Columns)
            {
                sheet.Cells[headerRow, tableStartCol + col.Index].Value2 = col.Name;
            }

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

        private string CopyRangeStyleToHtml(MSExcel.Range targetRange)
        {
            try
            {
                targetRange.Copy();
                IDataObject dataObject = Clipboard.GetDataObject();
                string result = null;
                if (dataObject != null && dataObject.GetDataPresent(DataFormats.Html))
                {
                    result = dataObject.GetData(DataFormats.Html) as string;
                }
                
                // CutCopyMode를 0으로 설정하여 클립보드 점유 해제 및 "대용량 데이터" 경고 방지
                try { targetRange.Application.CutCopyMode = (MSExcel.XlCutCopyMode)0; } catch { }
                
                return result;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CopyRangeStyleToHtml Error: {ex.Message}");
            }
            return null;
        }

        private void PasteStyleFromHtml(MSExcel.Range targetRange, string htmlData)
        {
            try
            {
                if (string.IsNullOrEmpty(htmlData)) return;

                DataObject dataObj = new DataObject();
                dataObj.SetData(DataFormats.Html, htmlData);
                // Persist를 false로 설정하여 프로세스 종료 시 클립보드 데이터를 유지하지 않음
                Clipboard.SetDataObject(dataObj, false);

                targetRange.Worksheet.Paste(targetRange);
                
                // 붙여넣기 후에도 CutCopyMode 해제
                try { targetRange.Application.CutCopyMode = (MSExcel.XlCutCopyMode)0; } catch { }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PasteStyleFromHtml Error: {ex.Message}");
            }
        }
    }
}

    


