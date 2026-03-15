using MSExcel = Microsoft.Office.Interop.Excel;

namespace RFGo.PhotoKey.Manager.Application.Interfaces
{
    public interface IExcelStyleService
    {
        string SerializeStyle(MSExcel.Range range);
        void ApplyStyle(MSExcel.Range range, string styleBundle);
    }
}
