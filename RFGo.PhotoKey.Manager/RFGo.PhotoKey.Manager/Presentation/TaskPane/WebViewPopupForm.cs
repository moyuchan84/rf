using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Newtonsoft.Json;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    public class WebViewPopupForm : Form
    {
        private Microsoft.Web.WebView2.WinForms.WebView2 webView;
        private string _jsonWorkbooks;
        private string _jsonHierarchy;
        private bool _isDetail;
        private string _resourcePath;

        public WebViewPopupForm(string jsonWorkbooks, string jsonHierarchy, bool isDetail = false, string title = "PhotoKey Manager", string resourcePath = "WorkSheetsLoader/preview.html")
        {
            _jsonWorkbooks = jsonWorkbooks;
            _jsonHierarchy = jsonHierarchy;
            _isDetail = isDetail;
            _resourcePath = resourcePath;
            
            this.Text = title;
            this.Size = new System.Drawing.Size(1200, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.WindowState = FormWindowState.Maximized;
            this.Icon = System.Drawing.SystemIcons.Application;

            // 생성자에서 즉시 호출 대신 Load 이벤트에 등록하여 폼 핸들이 생성된 후 UI 스레드에서 실행되도록 보장
            this.Load += (s, e) => InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                // 현재 스레드가 STA(Single-Threaded Apartment)인지 확인
                if (System.Threading.Thread.CurrentThread.GetApartmentState() != System.Threading.ApartmentState.STA)
                {
                    MessageBox.Show("WebView2 must be initialized on an STA thread.", "Thread Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                webView = new Microsoft.Web.WebView2.WinForms.WebView2();
                webView.Dock = DockStyle.Fill;
                this.Controls.Add(webView);

                string userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "RFGo.PhotoKey.Manager.Popup");
                
                if (!Directory.Exists(userDataFolder)) Directory.CreateDirectory(userDataFolder);

                var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView.EnsureCoreWebView2Async(environment);

                var bridge = new WebViewBridge();
                var workbookService = new Infrastructure.Excel.WorkbookService();
                bridge.RegisterModule(new WorkSheetsLoaderModule(workbookService));
                bridge.RegisterModule(new DataInquiryModule(workbookService));
                bridge.RegisterModule(new RequestSetupModule(workbookService));
                webView.CoreWebView2.AddHostObjectToScript("bridge", bridge);

                webView.CoreWebView2.NavigationCompleted += (s, e) =>
                {
                    if (_resourcePath.Contains("edit.html"))
                    {
                        var payload = new { photoKey = _jsonWorkbooks, hierarchy = _jsonHierarchy };
                        string script = $"if(window.initEdit) window.initEdit({JsonConvert.SerializeObject(payload)})";
                        webView.CoreWebView2.ExecuteScriptAsync(script);
                    }
                    else if (!string.IsNullOrEmpty(_jsonWorkbooks))
                    {
                        var payload = new { workbooks = _jsonWorkbooks, hierarchy = _jsonHierarchy, isDetail = _isDetail };
                        string script = $"if(window.initPreview) window.initPreview({JsonConvert.SerializeObject(payload)})";
                        webView.CoreWebView2.ExecuteScriptAsync(script);
                    }
                };

                string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", _resourcePath);
                if (File.Exists(htmlPath))
                {
                    webView.CoreWebView2.Navigate("file:///" + htmlPath.Replace("\\", "/"));
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("WebView2 Initialization Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
