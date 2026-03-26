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

        /// <summary>
        /// 비동기 인증 후 UI 스레드에서 지정된 액션을 실행하도록 보장하는 헬퍼 메서드
        /// </summary>
        private async void RunWithAuthCheck(Action action)
        {
            // 1. 현재 UI 스레드의 컨텍스트를 확보 (리본 클릭 시점은 STA 임)
            var uiContext = System.Threading.SynchronizationContext.Current;

            // 2. 만약 컨텍스트가 null이라면 (VSTO Ribbon 특성), WinForms용 컨텍스트를 생성하여 설치
            if (uiContext == null)
            {
                uiContext = new WindowsFormsSynchronizationContext();
                System.Threading.SynchronizationContext.SetSynchronizationContext(uiContext);
            }

            // 3. 인증 수행 (비동기 작업 포함)
            if (!await EnsureAuthenticatedAsync()) return;

            // 4. UI 스레드로 복귀하여 작업 실행 (uiContext는 이제 확실히 존재함)
            uiContext.Post(_ => 
            {
                try 
                { 
                    action(); 
                }
                catch (Exception ex) 
                { 
                    MessageBox.Show("UI Action Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error); 
                }
            }, null);
        }

        public void OnOpenTaskPane(Office.IRibbonControl control)
        {
            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            RunWithAuthCheck(() =>
            {
                if (window != null)
                {
                    var tp = TaskPaneManager.Instance.GetTaskPane(window, "WorkSheets Loader", "WorkSheetsLoader");
                    tp.Visible = !tp.Visible;
                }
            });
        }

        public void OnActiveWorkbookUpload(Office.IRibbonControl control)
        {
            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            RunWithAuthCheck(() =>
            {
                if (window != null)
                {
                    var tp = TaskPaneManager.Instance.GetTaskPane(window, "Active Workbook Upload", "ActiveWorkbookUpload");
                    tp.Visible = !tp.Visible;
                }
            });
        }

        public void OnOpenInquiryTaskPane(Office.IRibbonControl control)
        {
            RunWithAuthCheck(() =>
            {
                var form = new WebViewPopupForm(null, null, false, "Data Inquiry", "DataInquiry/index.html");
                form.Show();
            });
        }

        public void OnRequestSetupInquiry(Office.IRibbonControl control)
        {
            RunWithAuthCheck(() =>
            {
                var form = new WebViewPopupForm(null, null, false, "Request Setup Inquiry", "RequestSetupInquiry/index.html");
                form.Show();
            });
        }

        public void OnManageMasterData(Office.IRibbonControl control)
        {
            RunWithAuthCheck(() =>
            {
                var form = new WebViewPopupForm(null, null, false, "Manage Hierarchy Master Data", "MasterData/index.html");
                form.Show();
            });
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
