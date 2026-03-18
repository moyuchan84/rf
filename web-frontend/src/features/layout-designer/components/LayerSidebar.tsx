import React from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { Layers, Eye, Trash2 } from 'lucide-react';

export const LayerSidebar: React.FC = () => {
  const { boundary, placements, setBoundary, setPlacements } = useLayoutStore();

  return (
    <div className="w-80 h-full border-l border-slate-800 bg-slate-900 p-4 overflow-y-auto space-y-6">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Layers</h3>
        
        <div className="space-y-2">
          {boundary && (
            <div className="flex items-center justify-between p-2 bg-slate-800 rounded border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-medium">Boundary</span>
              </div>
              <button onClick={() => setBoundary(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {placements.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700 hover:border-indigo-500/50 transition-all">
              <div className="flex items-center gap-2 text-slate-300">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-medium">{p.id.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-slate-500 hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPlacements(placements.filter(item => item.id !== p.id))}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Properties</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black">Shot Size (mm)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="W" className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white" />
              <input type="number" placeholder="H" className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
