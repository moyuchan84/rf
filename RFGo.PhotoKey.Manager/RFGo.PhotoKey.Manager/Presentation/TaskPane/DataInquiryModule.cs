using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;
using System.Windows.Forms;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    [System.Runtime.InteropServices.ComVisible(true)]
    public class DataInquiryModule : IBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public DataInquiryModule(IWorkbookService workbookService)
        {
            _workbookService = workbookService;
        }

        public string Name => "inquiry";

        public void ShowDetail(string jsonWorkbookData, string jsonHierarchy)
        {
            // For now, we reuse WebViewPopupForm which points to WorkSheetsLoader/preview.html
            // We can pass a flag if we want to change behavior
            var form = new WebViewPopupForm(jsonWorkbookData, jsonHierarchy);
            form.Show();
        }

        public string RestoreToExcel(string jsonPhotoKeys)
        {
            try
            {
                // This will be called with a list of photo keys selected from DB
                // We need to parse the workbook_data from each photo key
                // Actually the frontend will pass the list of workbook_data objects
                var workbooks = JsonConvert.DeserializeObject<List<WorkbookData>>(jsonPhotoKeys);
                
                var thread = new System.Threading.Thread(() =>
                {
                    try {
                        _workbookService.RestoreWorkbooks(workbooks);
                        MessageBox.Show("Successfully restored to Excel.");
                    } catch (Exception ex) {
                        MessageBox.Show("Restore failed: " + ex.Message);
                    }
                });
                thread.SetApartmentState(System.Threading.ApartmentState.STA);
                thread.Start();
                
                return "Success";
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }
    }
}
