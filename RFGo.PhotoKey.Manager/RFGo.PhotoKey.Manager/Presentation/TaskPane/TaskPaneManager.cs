using System;
using System.Collections.Generic;
using Microsoft.Office.Tools;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    public class TaskPaneManager
    {
        private static TaskPaneManager _instance;
        private readonly Dictionary<string, CustomTaskPane> _taskPanes = new Dictionary<string, CustomTaskPane>();
        private readonly CustomTaskPaneCollection _taskPaneCollection;

        private TaskPaneManager(CustomTaskPaneCollection collection)
        {
            _taskPaneCollection = collection;
        }

        public static void Initialize(CustomTaskPaneCollection collection)
        {
            _instance = new TaskPaneManager(collection);
        }

        public static TaskPaneManager Instance => _instance;

        public CustomTaskPane GetTaskPane(object window, string title, string resourcePath)
        {
            string key = $"{window.GetHashCode()}_{title}";
            if (!_taskPanes.ContainsKey(key))
            {
                var control = new WebTaskPaneControl(resourcePath);
                var taskPane = _taskPaneCollection.Add(control, title, window);
                taskPane.Width = 1200;
                _taskPanes[key] = taskPane;
            }
            return _taskPanes[key];
        }

        public void RemoveTaskPane(object window)
        {
            // Simple removal might need refinement if multiple panes exist for one window
            // But usually, one window closure should clean up its panes.
        }
    }
}
