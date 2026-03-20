using System;
using System.IO;
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

        public string SelectFolder()
        {
            string selectedPath = string.Empty;
            var thread = new System.Threading.Thread(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "복원된 파일을 저장할 폴더를 선택하세요.";
                    if (dialog.ShowDialog(new NativeWindow { Handle = (IntPtr)Globals.ThisAddIn.Application.Hwnd }) == DialogResult.OK)
                    {
                        selectedPath = dialog.SelectedPath;
                    }
                }
            });
            thread.SetApartmentState(System.Threading.ApartmentState.STA);
            thread.Start();
            thread.Join();
            return selectedPath;
        }

        public string RestoreToExcel(string jsonItems, string baseFolder, bool openAfterRestore = false)
        {
            try
            {
                // items: List<{ workbookData: WorkbookData, targetPath: string }>
                var items = JsonConvert.DeserializeObject<List<RestoreItem>>(jsonItems);
                
                try {
                    foreach(var item in items)
                    {
                        // 폴더 생성
                        string directory = Path.GetDirectoryName(item.TargetPath);
                        if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

                        _workbookService.RestoreToExcel(item.WorkbookData, item.TargetPath, openAfterRestore);
                    }
                    
                    // MessageBox는 모달이므로 사용자가 '확인'을 누를 때까지 아래 return "Success"가 실행되지 않음.
                    // 따라서 프론트엔드의 await도 이 시점까지 유지됨.
                    MessageBox.Show("Successfully restored all files to:\n" + baseFolder, 
                                    "Restore Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    
                    return "Success";
                } catch (Exception ex) {
                    MessageBox.Show("Restore failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return "Error: " + ex.Message;
                }
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        private class RestoreItem
        {
            public WorkbookData WorkbookData { get; set; }
            public string TargetPath { get; set; }
        }
    }
}
