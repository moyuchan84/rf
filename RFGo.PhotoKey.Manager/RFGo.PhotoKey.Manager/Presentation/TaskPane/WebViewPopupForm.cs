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

            InitializeWebView();
        }

        private async void InitializeWebView()
        {
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
            bridge.RegisterModule(new WorkSheetsLoaderModule(new Infrastructure.Excel.WorkbookService()));
            bridge.RegisterModule(new DataInquiryModule(new Infrastructure.Excel.WorkbookService()));
            webView.CoreWebView2.AddHostObjectToScript("bridge", bridge);

            webView.CoreWebView2.NavigationCompleted += (s, e) =>
            {
                if (!string.IsNullOrEmpty(_jsonWorkbooks))
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
    }
}
