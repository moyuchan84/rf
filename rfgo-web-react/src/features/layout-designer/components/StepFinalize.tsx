import React from 'react';
import { Settings2, Download } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { LayerSidebar } from './LayerSidebar';
import { useLayoutStore } from '../store/useLayoutStore';
import toast from 'react-hot-toast';

export const StepFinalize: React.FC = () => {
  const stageRef = useLayoutStore(state => state.stageRef);
  const title = useLayoutStore(state => state.title);
  const boundary = useLayoutStore(state => state.boundary);

  const handleExportJPG = () => {
    if (!stageRef || !stageRef.current) {
      toast.error('Canvas is not ready yet.');
      return;
    }

    try {
      const stage = stageRef.current;
      
      // Save current transform state
      const oldScaleX = stage.scaleX();
      const oldScaleY = stage.scaleY();
      const oldX = stage.x();
      const oldY = stage.y();

      // Reset transform temporarily to perform 1:1 export
      stage.scaleX(1);
      stage.scaleY(1);
      stage.x(0);
      stage.y(0);
      stage.draw();

      const imageNode = stage.findOne('Image');
      
      // Configure export parameters
      // Export exact background image dimensions if available
      const exportParams: any = {
        mimeType: 'image/jpeg',
        quality: 0.95,
      };

      if (imageNode) {
        exportParams.x = imageNode.x();
        exportParams.y = imageNode.y();
        exportParams.width = imageNode.width();
        exportParams.height = imageNode.height();
      } else if (boundary) {
        exportParams.x = boundary.x;
        exportParams.y = boundary.y;
        exportParams.width = boundary.width;
        exportParams.height = boundary.height;
      }

      // Generate Data URL
      const dataUrl = stage.toDataURL(exportParams);

      // Restore original transform
      stage.scaleX(oldScaleX);
      stage.scaleY(oldScaleY);
      stage.x(oldX);
      stage.y(oldY);
      stage.draw();

      // Trigger file download
      const link = document.createElement('a');
      const safeTitle = title.replace(/[^a-zA-Z0-9가-힣-_]/g, '_');
      link.download = `${safeTitle}_layout.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Layout successfully exported as JPG!');
    } catch (error) {
      console.error('Failed to export layout to JPG:', error);
      toast.error('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0 px-2">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <Settings2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">Final Review & Fine-tune</h3>
        </div>
        <button
          onClick={handleExportJPG}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 active:scale-95 duration-200"
        >
          <Download className="w-4 h-4" />
          Export JPG
        </button>
      </div>
      
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Unified Height Container */}
        <div className="flex-1 h-[calc(100vh-280px)] bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner transition-colors">
          <LayoutCanvas />
        </div>
        
        <div className="w-80 h-[calc(100vh-280px)] shrink-0 flex flex-col overflow-hidden">
          <LayerSidebar />
        </div>
      </div>
    </div>
  );
};
