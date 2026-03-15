using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using Office = Microsoft.Office.Core;
using RFGo.PhotoKey.Manager.Presentation.TaskPane;

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

        public void OnOpenTaskPane(Office.IRibbonControl control)
        {
            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            if (window != null)
            {
                var tp = TaskPaneManager.Instance.GetTaskPane(window, "WorkSheets Loader", "WorkSheetsLoader");
                tp.Visible = !tp.Visible;
            }
        }

        public void OnActiveWorkbookUpload(Office.IRibbonControl control)
        {
            var window = control.Context as Microsoft.Office.Interop.Excel.Window;
            if (window != null)
            {
                var tp = TaskPaneManager.Instance.GetTaskPane(window, "Active Workbook Upload", "ActiveWorkbookUpload");
                tp.Visible = !tp.Visible;
            }
        }

        public void OnOpenInquiryTaskPane(Office.IRibbonControl control)
        {
            var form = new WebViewPopupForm(null, null, false, "Data Inquiry", "DataInquiry/index.html");
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
