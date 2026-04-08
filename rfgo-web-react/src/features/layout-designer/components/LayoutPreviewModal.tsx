import React, { useEffect } from 'react';
import { X, Maximize2, Download, Edit3 } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { useLayoutStore } from '../store/useLayoutStore';

interface LayoutPreviewModalProps {
  layout: any;
  onClose: () => void;
  onEdit: (layout: any) => void;
}

export const LayoutPreviewModal: React.FC<LayoutPreviewModalProps> = ({ layout, onClose, onEdit }) => {
  const { loadLayout } = useLayoutStore();

  useEffect(() => {
    // Load layout into store for the canvas to render
    if (layout) {
      loadLayout(layout);
    }
    // No cleanup reset here to avoid clearing if we want to transition to edit
  }, [layout, loadLayout]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{layout.title}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {layout.id} • Product ID: {layout.productId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onEdit(layout)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Mode
            </button>
            <div className="w-px h-6 bg-slate-200 dark:border-slate-800 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Main Viewport */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner">
            <LayoutCanvas />
          </div>

          {/* Info Panel */}
          <aside className="w-72 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Layout Metadata</h3>
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Strategy</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase">{layout.config?.strategy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Elements</span>
                  <span className="text-slate-900 dark:text-white font-black">{layout.placements?.length || 0} Keys</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Created</span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">{new Date(layout.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shot Configuration</h3>
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Real Width</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{layout.shotInfo?.realW || 0}mm</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Real Height</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{layout.shotInfo?.realH || 0}mm</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-auto">
               <button 
                 disabled
                 className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
               >
                 <Download className="w-3.5 h-3.5" /> Export Data (Coming Soon)
               </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
