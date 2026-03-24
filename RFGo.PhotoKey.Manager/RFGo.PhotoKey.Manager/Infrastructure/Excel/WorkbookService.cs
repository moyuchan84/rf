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
                workbookData.Meta.BinaryContent = GetWorkbookBinary(filePath);

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

            // 1. Style Bundle (No longer needed as we restore from full binary)
            // data.StyleBundle = CopyRangeStyleToHtml(usedRange);

            // 2. Find real anchor
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

            // 3. Identify header row
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

            // Set coordinates
            data.Origin.Row = absoluteStartRow;
            data.Origin.Col = absoluteStartCol;
            data.DataOrigin.Row = headerRow;
            data.DataOrigin.Col = startCol; 

            // 4. Extract metadata
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

            // 5. Columns and Aliasing
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

            // 6. Data rows
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
                workbookData.Meta.BinaryContent = GetWorkbookBinary(workbook.FullName);

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

        public bool RestoreToExcel(WorkbookData data, string targetFilePath, bool openAfterRestore = false)
        {
            try
            {
                if (string.IsNullOrEmpty(data.Meta.BinaryContent))
                {
                    throw new Exception("No binary content found in WorkbookData.");
                }

                byte[] bytes = Convert.FromBase64String(data.Meta.BinaryContent);
                string finalSavePath = targetFilePath;

                if (!string.IsNullOrEmpty(targetFilePath))
                {
                    string directory = Path.GetDirectoryName(targetFilePath);
                    if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                    {
                        Directory.CreateDirectory(directory);
                    }

                    if (Directory.Exists(targetFilePath))
                    {
                        finalSavePath = Path.Combine(targetFilePath, data.Meta.FileName ?? "RestoredWorkbook.xlsx");
                    }
                }
                else
                {
                    // If no target path, save to temp and open
                    string tempPath = Path.GetTempPath();
                    finalSavePath = Path.Combine(tempPath, data.Meta.FileName ?? "RestoredWorkbook.xlsx");
                    openAfterRestore = true;
                }

                File.WriteAllBytes(finalSavePath, bytes);

                if (openAfterRestore)
                {
                    MSExcel.Application excelApp = Globals.ThisAddIn.Application;
                    excelApp.Workbooks.Open(finalSavePath);
                    excelApp.Visible = true;
                }

                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"RestoreToExcel Error: {ex.Message}");
                return false;
            }
        }

        public void RestoreWorkbooks(List<WorkbookData> workbooks)
        {
            foreach (var wb in workbooks)
            {
                RestoreToExcel(wb, null, true);
            }
        }

        public void LoadToActiveWorkbook(WorkbookData data)
        {
            if (data == null || data.Meta == null || string.IsNullOrEmpty(data.Meta.BinaryContent))
                throw new Exception("No binary content found in WorkbookData.");

            MSExcel.Application excelApp = Globals.ThisAddIn.Application;
            MSExcel.Workbook activeWb = excelApp.ActiveWorkbook;
            if (activeWb == null)
            {
                activeWb = excelApp.Workbooks.Add();
            }

            string tempPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N") + ".xlsx");
            try
            {
                byte[] bytes = Convert.FromBase64String(data.Meta.BinaryContent);
                File.WriteAllBytes(tempPath, bytes);

                MSExcel.Workbook refWb = excelApp.Workbooks.Open(tempPath);
                try
                {
                    for (int i = 1; i <= refWb.Sheets.Count; i++)
                    {
                        MSExcel.Worksheet sheet = refWb.Sheets[i] as MSExcel.Worksheet;
                        if (sheet != null)
                        {
                            // Ensure unique name in target workbook
                            string baseName = sheet.Name;
                            int suffix = 1;
                            string targetName = baseName;
                            
                            bool nameExists = true;
                            while (nameExists)
                            {
                                nameExists = false;
                                foreach (MSExcel.Worksheet s in activeWb.Sheets)
                                {
                                    if (s.Name.Equals(targetName, StringComparison.OrdinalIgnoreCase))
                                    {
                                        targetName = $"{baseName}_{suffix++}";
                                        nameExists = true;
                                        break;
                                    }
                                }
                            }
                            
                            sheet.Name = targetName;
                            sheet.Copy(After: activeWb.Sheets[activeWb.Sheets.Count]);
                        }
                    }
                }
                finally
                {
                    refWb.Close(false);
                    System.Runtime.InteropServices.Marshal.ReleaseComObject(refWb);
                }
            }
            finally
            {
                if (File.Exists(tempPath))
                {
                    try { File.Delete(tempPath); } catch { }
                }
            }
        }

        private string GetWorkbookBinary(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath)) return null;

                // Use FileStream with FileShare.ReadWrite to allow reading while Excel has it open
                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    using (var ms = new MemoryStream())
                    {
                        stream.CopyTo(ms);
                        return Convert.ToBase64String(ms.ToArray());
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetWorkbookBinary Error: {ex.Message}");
                return null;
            }
        }
    }
}
  

    


