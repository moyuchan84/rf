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
    public class RequestSetupModule : SafeBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public RequestSetupModule(IWorkbookService workbookService) : base()
        {
            _workbookService = workbookService;
        }

        public override string Name => "request";

        public void LoadReferenceToExcel(string jsonReferences)
        {
            RunOnUI(() =>
            {
                if (string.IsNullOrEmpty(jsonReferences)) return;
                var references = JsonConvert.DeserializeObject<List<PhotoKeyModel>>(jsonReferences);
                if (references == null || references.Count == 0) return;

                foreach (var refItem in references)
                {
                    if (refItem.workbook_data != null)
                    {
                        _workbookService.LoadToActiveWorkbook(refItem.workbook_data);
                    }
                }

                MessageBox.Show(GetOwner(), $"{references.Count} reference tables loaded to Excel.",
                                "Load Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            });
        }

        public void DownloadAsExcel(string jsonReferences, string targetFolder)
        {
            RunOnUI(() =>
            {
                if (string.IsNullOrEmpty(jsonReferences)) return;
                var references = JsonConvert.DeserializeObject<List<PhotoKeyModel>>(jsonReferences);
                if (references == null || references.Count == 0) return;

                if (!Directory.Exists(targetFolder)) Directory.CreateDirectory(targetFolder);

                int count = 0;
                foreach (var refItem in references)
                {
                    if (refItem.workbook_data != null)
                    {
                        string safeFileName = string.IsNullOrEmpty(refItem.filename)
                            ? $"{refItem.table_name}_Rev{refItem.rev_no}.xlsx"
                            : refItem.filename;

                        foreach (char c in Path.GetInvalidFileNameChars()) { safeFileName = safeFileName.Replace(c, '_'); }

                        string fullPath = Path.Combine(targetFolder, safeFileName);
                        _workbookService.RestoreToExcel(refItem.workbook_data, fullPath, false);
                        count++;
                    }
                }

                MessageBox.Show(GetOwner(), $"Successfully downloaded {count} files to:\n{targetFolder}",
                                "Download Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            });
        }

        public string RestoreToExcel(string jsonItems, string baseFolder, bool openAfterRestore = false)
        {
            return RunOnUI(() =>
            {
                if (string.IsNullOrEmpty(jsonItems)) return "Error: No data";
                var items = JsonConvert.DeserializeObject<List<RestoreItem>>(jsonItems);
                if (items == null || items.Count == 0) return "Error: Invalid data format";

                foreach (var item in items)
                {
                    if (item.WorkbookData == null || string.IsNullOrEmpty(item.TargetPath)) continue;

                    string directory = Path.GetDirectoryName(item.TargetPath);
                    if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

                    _workbookService.RestoreToExcel(item.WorkbookData, item.TargetPath, openAfterRestore);
                }

                MessageBox.Show(GetOwner(), "Successfully processed files to:\n" + baseFolder,
                                "Process Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);

                return "Success";
            });
        }

        public string SelectFolder()
        {
            return RunOnUI(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "Select a folder to save the Excel files.";
                    if (dialog.ShowDialog(GetOwner()) == DialogResult.OK)
                    {
                        return dialog.SelectedPath;
                    }
                }
                return string.Empty;
            });
        }

        private class RestoreItem
        {
            public WorkbookData WorkbookData { get; set; }
            public string TargetPath { get; set; }
        }

        // Helper class to match FastAPI response schema
        private class PhotoKeyModel
        {
            public int id { get; set; }
            public string table_name { get; set; }
            public int rev_no { get; set; }
            public WorkbookData workbook_data { get; set; }
            public string filename { get; set; }
        }
    }
}
