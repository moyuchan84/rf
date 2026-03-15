using System;
using System.Collections.Generic;
using Microsoft.Office.Tools;

namespace RFGo.PhotoKey.Manager.Presentation.TaskPane
{
    public class TaskPaneManager
    {
        private static TaskPaneManager _instance;
        private readonly Dictionary<object, CustomTaskPane> _taskPanes = new Dictionary<object, CustomTaskPane>();
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

        public CustomTaskPane GetTaskPane(object window, string title)
        {
            if (!_taskPanes.ContainsKey(window))
            {
                var control = new WebTaskPaneControl();
                var taskPane = _taskPaneCollection.Add(control, title, window);
                taskPane.Width = 1200; // 2x larger than previous 600
                _taskPanes[window] = taskPane;
            }
            return _taskPanes[window];
        }

        public void RemoveTaskPane(object window)
        {
            if (_taskPanes.ContainsKey(window))
            {
                _taskPaneCollection.Remove(_taskPanes[window]);
                _taskPanes.Remove(window);
            }
        }
    }
}
