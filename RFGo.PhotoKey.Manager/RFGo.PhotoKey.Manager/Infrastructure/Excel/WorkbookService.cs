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

        private WorksheetData ParseWorksheet(MSExcel.Worksheet sheet, int index)
        {
            var data = new WorksheetData
            {
                SheetName = sheet.Name,
                SheetType = (index == 1) ? "HISTORY" : "DATA"
            };

            MSExcel.Range usedRange = sheet.UsedRange;
            if (usedRange == null) return data;

            MSExcel.Range firstCell = FindFirstCell(usedRange);
            if (firstCell == null) return data;

            data.Origin.Row = firstCell.Row;
            data.Origin.Col = firstCell.Column;

            // SheetType에 관계없이 데이터 파싱 수행 (History도 테이블 데이터가 있으므로)
            ProcessDataSheet(sheet, data, firstCell);
            
            return data;
        }

        private MSExcel.Range FindFirstCell(MSExcel.Range usedRange)
        {
            foreach (MSExcel.Range cell in usedRange)
            {
                if (cell.Value2 != null && !string.IsNullOrEmpty(cell.Value2.ToString()))
                    return cell;
            }
            return null;
        }

        private void ProcessDataSheet(MSExcel.Worksheet sheet, WorksheetData data, MSExcel.Range startCell)
        {
            int startRow = startCell.Row;
            int startCol = startCell.Column;

            // 1. 헤더 행(첫 셀이 ';'로 시작하는 행) 찾기
            int headerRow = -1;
            int maxSearchRows = 100; // 안전장치
            for (int r = startRow; r < startRow + maxSearchRows; r++)
            {
                string val = sheet.Cells[r, startCol].Value2?.ToString();
                if (val != null && val.StartsWith(";"))
                {
                    headerRow = r;
                    break;
                }
            }

            if (headerRow == -1) headerRow = startRow; // 못찾으면 시작점을 헤더로 간주

            // 2. 헤더 행 이전의 수직 셀들을 MetaInfo로 수집
            for (int r = startRow; r < headerRow; r++)
            {
                string val = sheet.Cells[r, startCol].Value2?.ToString();
                if (!string.IsNullOrEmpty(val))
                {
                    // "Key: Value" 형태면 파싱, 아니면 순번으로 저장
                    if (val.Contains(":"))
                    {
                        var split = val.Split(':');
                        data.MetaInfo[split[0].Trim()] = split.Length > 1 ? split[1].Trim() : "";
                    }
                    else
                    {
                        data.MetaInfo[$"Meta_{r - startRow + 1}"] = val;
                    }
                }
            }

            data.PhotoCategory = data.MetaInfo.Count > 0 ? "key" : "info";

            // 3. 헤더 및 Aliasing (Columns 리스트 생성)
            int lastCol = sheet.Cells[headerRow, sheet.Columns.Count].End[MSExcel.XlDirection.xlToLeft].Column;
            data.Columns.Clear();
            for (int j = startCol; j <= lastCol; j++)
            {
                string header = sheet.Cells[headerRow, j].Value2?.ToString() ?? $"EMPTY_{j}";
                string cleanHeader = header.StartsWith(";") ? header.Substring(1) : header;
                
                data.Columns.Add(new ColumnDefinition 
                { 
                    Key = $"col_{j - startCol}", 
                    Name = cleanHeader, 
                    Index = j - startCol 
                });
            }

            // 4. 데이터 행 파싱
            int lastRow = sheet.Cells[sheet.Rows.Count, startCol].End[MSExcel.XlDirection.xlUp].Row;
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
                
                if (hasData)
                {
                    if (data.TableData.Count == 0) 
                        data.StyleBundle = _styleSerializer.SerializeStyle(sheet.Cells[i, startCol]);
                    data.TableData.Add(row);
                }
            }
        }

        public bool SaveToPreconfirmTable(WorkbookData data) => true;
        public bool RestoreToExcel(WorkbookData data, string targetFilePath) => true;
    }
}
