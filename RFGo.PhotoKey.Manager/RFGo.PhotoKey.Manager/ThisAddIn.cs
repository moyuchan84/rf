using System;
using Excel = Microsoft.Office.Interop.Excel;
using RFGo.PhotoKey.Manager.Presentation.TaskPane;
using RFGo.PhotoKey.Manager.Presentation.Ribbon;

namespace RFGo.PhotoKey.Manager
{
    public partial class ThisAddIn
    {
        private void ThisAddIn_Startup(object sender, System.EventArgs e)
        {
            TaskPaneManager.Initialize(this.CustomTaskPanes);
        }

        protected override Microsoft.Office.Core.IRibbonExtensibility CreateRibbonExtensibilityObject()
        {
            return new RFGoRibbon();
        }

        private void ThisAddIn_Shutdown(object sender, System.EventArgs e)
        {
        }

        #region VSTO에서 생성한 코드
        private void InternalStartup()
        {
            this.Startup += new System.EventHandler(ThisAddIn_Startup);
            this.Shutdown += new System.EventHandler(ThisAddIn_Shutdown);
        }
        #endregion
    }
}
