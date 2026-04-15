using System;
using System.Collections.Generic;
using System.Windows.Forms;
using Newtonsoft.Json;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;
using RFGo.PhotoKey.Manager;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    [System.Runtime.InteropServices.ComVisible(true)]
    [System.Runtime.InteropServices.ClassInterface(System.Runtime.InteropServices.ClassInterfaceType.AutoDual)]
    public class WorkSheetsLoaderModule : SafeBridgeModule
    {
        private readonly IWorkbookService _workbookService;

        public WorkSheetsLoaderModule(IWorkbookService workbookService) : base()
        {
            _workbookService = workbookService;
        }

        public override string Name => "loader";

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
            return RunOnUI(() =>
            {
                using (var dialog = new FolderBrowserDialog())
                {
                    dialog.Description = "엑셀 파일이 포함된 폴더를 선택하세요.";
                    dialog.ShowNewFolderButton = false;
                    if (dialog.ShowDialog(GetOwner()) == DialogResult.OK)
                    {
                        return dialog.SelectedPath;
                    }
                }
                return string.Empty;
            });
        }

        public string ParseFile(string filePath)
        {
            return RunOnUI(() =>
            {
                try
                {
                    var data = _workbookService.ParseWorkbook(filePath);
                    return JsonConvert.SerializeObject(data);
                }
                catch (Exception ex) { return "Error: " + ex.Message; }
            });
        }

        public string ParseActiveWorkbook()
        {
            return RunOnUI(() =>
            {
                try
                {
                    var data = _workbookService.ParseActiveWorkbook();
                    return JsonConvert.SerializeObject(data);
                }
                catch (Exception ex) { return "Error: " + ex.Message; }
            });
        }

        public string ParseFiles(string jsonFilePaths)
        {
            return RunOnUI(() =>
            {
                try
                {
                    var filePaths = JsonConvert.DeserializeObject<List<string>>(jsonFilePaths);
                    var results = new System.Collections.Concurrent.ConcurrentBag<WorkbookData>();
                    
                    // 최대 4개의 엑셀 프로세스를 동시에 사용 (메모리 사용량 고려)
                    System.Threading.Tasks.Parallel.ForEach(filePaths, 
                        new System.Threading.Tasks.ParallelOptions { MaxDegreeOfParallelism = 4 }, 
                        filePath => 
                    {
                        try 
                        {
                            var data = _workbookService.ParseWorkbook(filePath);
                            results.Add(data);
                        }
                        catch (Exception) { /* 개별 파일 오류는 무시 */ }
                    });

                    return JsonConvert.SerializeObject(results);
                }
                catch (Exception ex) { return "Error: " + ex.Message; }
            });
        }

        public void ShowPreview(string jsonWorkbooks, string jsonHierarchy)
        {
            RunOnUI(() =>
            {
                var form = new WebViewPopupForm(jsonWorkbooks, jsonHierarchy);
                form.Show();
            });
        }

        public string SaveToDb(string jsonPayload)
        {
            try { return JsonConvert.SerializeObject(new { success = true }); }
            catch (Exception ex) { return "Error: " + ex.Message; }
        }
    }
}
