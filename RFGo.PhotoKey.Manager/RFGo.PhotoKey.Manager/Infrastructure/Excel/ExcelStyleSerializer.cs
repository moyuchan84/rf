using System;
using System.Text;
using System.Windows.Forms;
using MSExcel = Microsoft.Office.Interop.Excel;
using RFGo.PhotoKey.Manager.Application.Interfaces;

namespace RFGo.PhotoKey.Manager.Infrastructure.Excel
{
    public class ExcelStyleSerializer : IExcelStyleService
    {
        public string SerializeStyle(MSExcel.Range range)
        {
            if (range == null) return string.Empty;

            string htmlData = string.Empty;
            var thread = new System.Threading.Thread(() =>
            {
                try
                {
                    // 1. 엑셀 영역을 클립보드로 복사
                    range.Copy();

                    // 2. 클립보드에서 HTML Format 데이터 추출
                    IDataObject dataObject = Clipboard.GetDataObject();
                    if (dataObject != null && dataObject.GetDataPresent(DataFormats.Html))
                    {
                        htmlData = dataObject.GetData(DataFormats.Html) as string;
                    }
                    
                    // 클립보드 비우기 (선택사항)
                    Clipboard.Clear();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Style Serialization Error: " + ex.Message);
                }
            });

            thread.SetApartmentState(System.Threading.ApartmentState.STA);
            thread.Start();
            thread.Join();

            return htmlData;
        }

        public void ApplyStyle(MSExcel.Range range, string styleBundle)
        {
            if (range == null || string.IsNullOrEmpty(styleBundle)) return;

            var thread = new System.Threading.Thread(() =>
            {
                MSExcel.Application app = null;
                bool originalDisplayAlerts = true;
                try
                {
                    app = range.Application;
                    originalDisplayAlerts = app.DisplayAlerts;
                    app.DisplayAlerts = false; // 1. 경고창 비활성화

                    // 2. 저장된 HTML 데이터를 클립보드에 설정
                    DataObject dataObject = new DataObject();
                    dataObject.SetData(DataFormats.Html, styleBundle);
                    Clipboard.SetDataObject(dataObject, true);

                    // 3. 대상 영역의 '첫 번째 셀'만 타겟팅 (영역 불일치 팝업 방지 핵심)
                    MSExcel.Worksheet ws = range.Worksheet;
                    ws.Activate();
                    MSExcel.Range topLeftCell = ws.Cells[range.Row, range.Column];
                    topLeftCell.Select();
                    
                    // 4. 붙여넣기
                    ws.Paste(topLeftCell);
                    
                    Clipboard.Clear();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Style Application Error: " + ex.Message);
                }
                finally
                {
                    if (app != null) app.DisplayAlerts = originalDisplayAlerts; // 5. 상태 원복
                }
            });

            thread.SetApartmentState(System.Threading.ApartmentState.STA);
            thread.Start();
            thread.Join();
        }
    }
}
