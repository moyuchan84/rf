using System;
using System.Collections.Generic;
using System.Windows.Forms;
using Newtonsoft.Json;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    [System.Runtime.InteropServices.ComVisible(true)]
    public class WorkSheetsLoaderModule : IBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public WorkSheetsLoaderModule(IWorkbookService workbookService)
        {
            _workbookService = workbookService;
        }

        public string Name => "loader";

        public string GetFiles(string path)
        {
            try
            {
                var files = _workbookService.GetExcelFilesFromDirectory(path);
                return JsonConvert.SerializeObject(files);
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        public string SelectFolder()
        {
            string selectedPath = string.Empty;
            var thread = new System.Threading.Thread(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "엑셀 파일이 포함된 폴더를 선택하세요.";
                    dialog.ShowNewFolderButton = false;
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

        public string ParseFile(string filePath)
        {
            try
            {
                var data = _workbookService.ParseWorkbook(filePath);
                return JsonConvert.SerializeObject(data);
            }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }

        public void ShowPreview(string jsonWorkbooks, string jsonHierarchy)
        {
            var form = new WebViewPopupForm(jsonWorkbooks, jsonHierarchy);
            form.Show();
        }

        public string SaveToDb(string jsonPayload)
        {
            try { return JsonConvert.SerializeObject(new { success = true }); }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }
    }

    internal class NativeWindow : IWin32Window
    {
        public IntPtr Handle { get; set; }
    }
}
