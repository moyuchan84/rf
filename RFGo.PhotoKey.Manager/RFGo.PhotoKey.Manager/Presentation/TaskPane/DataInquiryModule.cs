using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;
using System.Windows.Forms;
using RFGo.PhotoKey.Manager;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    [System.Runtime.InteropServices.ComVisible(true)]
    [System.Runtime.InteropServices.ClassInterface(System.Runtime.InteropServices.ClassInterfaceType.AutoDual)]
    public class DataInquiryModule : SafeBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public DataInquiryModule(IWorkbookService workbookService) : base()
        {
            _workbookService = workbookService;
        }

        public override string Name => "inquiry";

        public void ShowDetail(string jsonWorkbookData, string jsonHierarchy)
        {
            RunOnUI(() =>
            {
                var form = new WebViewPopupForm(jsonWorkbookData, jsonHierarchy, true, "PhotoKey Detail View");
                form.Show();
            });
        }

        public void ShowEdit(string jsonPhotoKey, string jsonHierarchy)
        {
            RunOnUI(() =>
            {
                var form = new WebViewPopupForm(jsonPhotoKey, jsonHierarchy, false, "Edit PhotoKey Attributes", "DataInquiry/edit.html");
                form.Show();
            });
        }

        public string SelectFolder()
        {
            return RunOnUI(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "복원된 파일을 저장할 폴더를 선택하세요.";
                    if (dialog.ShowDialog(GetOwner()) == DialogResult.OK)
                    {
                        return dialog.SelectedPath;
                    }
                }
                return string.Empty;
            });
        }

        public string RestoreToExcel(string jsonItems, string baseFolder, bool openAfterRestore = false)
        {
            return RunOnUI(() =>
            {
                try
                {
                    var items = JsonConvert.DeserializeObject<List<RestoreItem>>(jsonItems);
                    if (items == null) return "Error: Invalid data";

                    foreach (var item in items)
                    {
                        string directory = Path.GetDirectoryName(item.TargetPath);
                        if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

                        _workbookService.RestoreToExcel(item.WorkbookData, item.TargetPath, openAfterRestore);
                    }

                    MessageBox.Show(GetOwner(), "Successfully restored all files to:\n" + baseFolder,
                                    "Restore Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);

                    return "Success";
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"RestoreToExcel Error: {ex}");
                    MessageBox.Show(GetOwner(), "Restore failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return "Error: " + ex.Message;
                }
            });
        }

        private class RestoreItem
        {
            public WorkbookData WorkbookData { get; set; }
            public string TargetPath { get; set; }
        }
    }
}
