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

        public WebViewPopupForm(string jsonWorkbooks, string jsonHierarchy)
        {
            _jsonWorkbooks = jsonWorkbooks;
            _jsonHierarchy = jsonHierarchy;
            
            this.Text = "Data Confirmation - PhotoKey Manager";
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

            webView.CoreWebView2.NavigationCompleted += (s, e) =>
            {
                var payload = new { workbooks = _jsonWorkbooks, hierarchy = _jsonHierarchy };
                // Use Newtonsoft.Json
                string script = $"window.initPreview({JsonConvert.SerializeObject(payload)})";
                webView.CoreWebView2.ExecuteScriptAsync(script);
            };

            string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "WorkSheetsLoader", "preview.html");
            if (File.Exists(htmlPath))
            {
                webView.CoreWebView2.Navigate("file:///" + htmlPath.Replace("\\", "/"));
            }
        }
    }
}
