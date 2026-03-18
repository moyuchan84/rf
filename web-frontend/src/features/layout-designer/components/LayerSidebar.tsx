import React from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { Layers, Eye, Trash2 } from 'lucide-react';

export const LayerSidebar: React.FC = () => {
  const { boundary, placements, setBoundary, setPlacements } = useLayoutStore();

  return (
    <div className="w-80 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto space-y-6 transition-colors shadow-sm dark:shadow-xl">
      <div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Layers</h3>
        
        <div className="space-y-2">
          {boundary && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-indigo-500/20 dark:border-indigo-500/30 shadow-sm transition-all">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-tight">Boundary</span>
              </div>
              <button onClick={() => setBoundary(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {placements.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all shadow-sm group">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{p.id.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setPlacements(placements.filter(item => item.id !== p.id))}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Properties</h3>
        <div className="space-y-4">
          <div className="space-y-2 px-1">
            <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest block">Shot Size (mm)</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 uppercase">W</span>
                <input type="number" placeholder="0.0" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md pl-6 pr-2 py-2 text-[11px] font-bold text-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 uppercase">H</span>
                <input type="number" placeholder="0.0" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md pl-6 pr-2 py-2 text-[11px] font-bold text-slate-700 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
