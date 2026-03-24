using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using Office = Microsoft.Office.Core;
using RFGo.PhotoKey.Manager.Presentation.TaskPane;

using System.Threading.Tasks;
using System.Windows.Forms;
using RFGo.PhotoKey.Manager.Infrastructure.Auth;

namespace RFGo.PhotoKey.Manager.Presentation.Ribbon
{
    [ComVisible(true)]
    public class RFGoRibbon : Office.IRibbonExtensibility
    {
        private Office.IRibbonUI ribbon;

        public RFGoRibbon() { }

        public string GetCustomUI(string ribbonID)
        {
            return GetResourceText("RFGo.PhotoKey.Manager.Presentation.Ribbon.RFGoRibbon.xml");
        }

        public void Ribbon_Load(Office.IRibbonUI ribbonUI)
        {
            this.ribbon = ribbonUI;
        }

        private async Task<bool> EnsureAuthenticatedAsync()
        {
            if (!AuthService.Instance.IsAuthenticated)
            {
                bool success = await AuthService.Instance.LoginAsync();
                if (!success)
                {
                    MessageBox.Show("인증에 실패하였습니다.");
                    return false;
                }
            }

            if (!AuthService.Instance.IsAdminOrInno())
            {
                MessageBox.Show("접근 권한이 없습니다. (ADMIN, INNO 전용)");
                return false;
            }

            return true;
        }

        public async void OnOpenTaskPane(Office.IRibbonControl control)
        {
            if (!await EnsureAuthenticatedAsync()) return;

            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            if (window != null)
            {
                var tp = TaskPaneManager.Instance.GetTaskPane(window, "WorkSheets Loader", "WorkSheetsLoader");
                tp.Visible = !tp.Visible;
            }
        }

        public async void OnActiveWorkbookUpload(Office.IRibbonControl control)
        {
            if (!await EnsureAuthenticatedAsync()) return;

            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            if (window != null)
            {
                var tp = TaskPaneManager.Instance.GetTaskPane(window, "Active Workbook Upload", "ActiveWorkbookUpload");
                tp.Visible = !tp.Visible;
            }
        }

        public async void OnOpenInquiryTaskPane(Office.IRibbonControl control)
        {
            if (!await EnsureAuthenticatedAsync()) return;

            var form = new WebViewPopupForm(null, null, false, "Data Inquiry", "DataInquiry/index.html");
            form.Show();
        }

        public async void OnRequestSetupInquiry(Office.IRibbonControl control)
        {
            if (!await EnsureAuthenticatedAsync()) return;

            var form = new WebViewPopupForm(null, null, false, "Request Setup Inquiry", "RequestSetupInquiry/index.html");
            form.Show();
        }

        public async void OnManageMasterData(Office.IRibbonControl control)
        {
            if (!await EnsureAuthenticatedAsync()) return;

            var form = new WebViewPopupForm(null, null, false, "Manage Hierarchy Master Data", "MasterData/index.html");
            form.Show();
        }

        private static string GetResourceText(string resourceName)
        {
            Assembly asm = Assembly.GetExecutingAssembly();
            string[] resourceNames = asm.GetManifestResourceNames();
            for (int i = 0; i < resourceNames.Length; ++i)
            {
                if (string.Compare(resourceName, resourceNames[i], StringComparison.OrdinalIgnoreCase) == 0)
                {
                    using (StreamReader resourceReader = new StreamReader(asm.GetManifestResourceStream(resourceNames[i])))
                    {
                        if (resourceReader != null)
                        {
                            return resourceReader.ReadToEnd();
                        }
                    }
                }
            }
            return null;
        }
    }
}
