using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;

namespace RFGo.PhotoKey.Manager
{
    [ComVisible(true)]
    public interface IBridgeModule
    {
        string Name { get; }
    }

    [ComVisible(true)]
    public class WindowWrapper : IWin32Window
    {
        public WindowWrapper(IntPtr handle) { Handle = handle; }
        public IntPtr Handle { get; }
    }

    public static class UIThreadHelper
    {
        public static void ExecuteOnUI(Action action)
        {
            if (Control.CheckForIllegalCrossThreadCalls)
            {
                var form = System.Windows.Forms.Application.OpenForms.Count > 0 ? System.Windows.Forms.Application.OpenForms[0] : null;
                if (form != null && form.InvokeRequired)
                {
                    form.Invoke(action);
                    return;
                }
            }
            action();
        }

        public static IWin32Window GetExcelWindow()
        {
            try { return new WindowWrapper((IntPtr)Globals.ThisAddIn.Application.Hwnd); }
            catch { return null; }
        }
    }

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.AutoDual)]
    public abstract class SafeBridgeModule : IBridgeModule
    {
        public abstract string Name { get; }

        protected SafeBridgeModule() { }

        protected void RunOnUI(Action action)
        {
            try
            {
                UIThreadHelper.ExecuteOnUI(action);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SafeBridgeModule Error: {ex}");
                MessageBox.Show(GetOwner(), "Internal Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        protected T RunOnUI<T>(Func<T> func)
        {
            T result = default;
            UIThreadHelper.ExecuteOnUI(() => {
                try { result = func(); }
                catch (Exception ex) {
                    System.Diagnostics.Debug.WriteLine($"SafeBridgeModule Error: {ex}");
                    MessageBox.Show(GetOwner(), "Internal Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            });
            return result;
        }

        protected IWin32Window GetOwner()
        {
            return UIThreadHelper.GetExcelWindow();
        }
    }
}
