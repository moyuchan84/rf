using System;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Collections.Generic;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Infrastructure.Excel;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    public partial class WebTaskPaneControl : UserControl
    {
        private Microsoft.Web.WebView2.WinForms.WebView2 webView;
        private readonly IWorkbookService _workbookService = new WorkbookService();
        private readonly string _resourceSubPath;

        public WebTaskPaneControl(string resourceSubPath)
        {
            _resourceSubPath = resourceSubPath;
            InitializeComponent();
            InitializeWebViewContainer();
            InitializeWebView();
        }

        private void InitializeWebViewContainer()
        {
            this.webView = new Microsoft.Web.WebView2.WinForms.WebView2();
            ((System.ComponentModel.ISupportInitialize)(this.webView)).BeginInit();
            this.SuspendLayout();
            this.webView.Dock = DockStyle.Fill;
            this.webView.Name = "webView";
            this.Controls.Add(this.webView);
            ((System.ComponentModel.ISupportInitialize)(this.webView)).EndInit();
            this.ResumeLayout(false);
        }

        private async void InitializeWebView()
        {
            try
            {
                string userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), 
                    "RFGo.PhotoKey.Manager");
                
                if (!Directory.Exists(userDataFolder)) Directory.CreateDirectory(userDataFolder);

                var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView.EnsureCoreWebView2Async(environment);
                
                var bridge = new WebViewBridge();
                bridge.RegisterModule(new WorkSheetsLoaderModule(_workbookService));
                bridge.RegisterModule(new DataInquiryModule(_workbookService));
                bridge.RegisterModule(new RequestSetupModule(_workbookService));
                
                webView.CoreWebView2.AddHostObjectToScript("bridge", bridge);
                
                string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", _resourceSubPath, "index.html");
                if (File.Exists(htmlPath))
                {
                    webView.CoreWebView2.Navigate("file:///" + htmlPath.Replace("\\", "/"));
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("WebView2 초기화 실패: " + ex.Message);
            }
        }
    }

    [System.Runtime.InteropServices.ComVisible(true)]
    public class WebViewBridge
    {
        private readonly Dictionary<string, object> _modules = new Dictionary<string, object>();

        public void RegisterModule(IBridgeModule module)
        {
            _modules[module.Name] = module;
        }

        public object loader => _modules.ContainsKey("loader") ? _modules["loader"] : null;
        public object inquiry => _modules.ContainsKey("inquiry") ? _modules["inquiry"] : null;
        public object request => _modules.ContainsKey("request") ? _modules["request"] : null;
    }
}
