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
    public class RequestSetupModule : IBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public RequestSetupModule(IWorkbookService workbookService)
        {
            _workbookService = workbookService;
        }

        public string Name => "request";

        public void LoadReferenceToExcel(string jsonReferences)
        {
            try
            {
                var references = JsonConvert.DeserializeObject<List<PhotoKeyModel>>(jsonReferences);
                if (references == null || references.Count == 0) return;

                foreach (var refItem in references)
                {
                    if (refItem.workbook_data != null)
                    {
                        // Load each reference table into the active workbook
                        _workbookService.LoadToActiveWorkbook(refItem.workbook_data);
                    }
                }
                
                MessageBox.Show($"{references.Count} reference tables loaded to Excel.", 
                                "Load Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to load to Excel: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public void DownloadAsExcel(string jsonReferences, string targetFolder)
        {
            try
            {
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
                        
                        string fullPath = Path.Combine(targetFolder, safeFileName);
                        _workbookService.RestoreToExcel(refItem.workbook_data, fullPath, false);
                        count++;
                    }
                }

                MessageBox.Show($"Successfully downloaded {count} files to:\n{targetFolder}", 
                                "Download Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Download failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public string RestoreToExcel(string jsonItems, string baseFolder, bool openAfterRestore = false)
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

                MessageBox.Show("Successfully restored all files to:\n" + baseFolder, 
                                "Restore Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                return "Success";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Restore failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return "Error: " + ex.Message;
            }
        }

        public string SelectFolder()
        {
            string selectedPath = string.Empty;
            var thread = new System.Threading.Thread(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "Select a folder to save the Excel files.";
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
