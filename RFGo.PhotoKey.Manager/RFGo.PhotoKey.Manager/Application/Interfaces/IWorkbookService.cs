using System.Collections.Generic;
using RFGo.PhotoKey.Manager.Domain.Models;

namespace RFGo.PhotoKey.Manager.Application.Interfaces
{
    public interface IWorkbookService
    {
        List<WorkbookMeta> GetExcelFilesFromDirectory(string directoryPath);
        WorkbookData ParseWorkbook(string filePath);
        WorkbookData ParseActiveWorkbook();
        bool SaveToPreconfirmTable(WorkbookData data);
        bool RestoreToExcel(WorkbookData data, string targetFilePath);
        void RestoreWorkbooks(List<WorkbookData> workbooks);
    }
}
