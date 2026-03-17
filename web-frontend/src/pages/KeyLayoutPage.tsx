import React from 'react';
import { Layers, MousePointer2, Move, Maximize2, Save } from 'lucide-react';

const KeyLayoutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">레이아웃</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Reticle Placement Designer</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:text-white transition-all uppercase tracking-widest shadow-sm">
            Auto Arrange
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-md text-[10px] font-black text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">
            <Save className="w-3.5 h-3.5" />
            Save Layout
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Editor Area */}
        <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md relative overflow-hidden flex items-center justify-center group shadow-sm transition-all">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-10 pointer-events-none"></div>
          
          {/* Canvas Placeholder */}
          <div className="w-[480px] h-[320px] border border-indigo-500/30 rounded-md relative bg-slate-50 dark:bg-slate-950/80 shadow-xl overflow-hidden transition-all">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-[0.05] dark:opacity-20">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-slate-300 dark:border-slate-800"></div>
              ))}
            </div>
            
            {/* Mock Reticle Area */}
            <div className="absolute inset-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-md flex items-center justify-center transition-colors">
              <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Reticle_Boundary</span>
            </div>

            {/* Mock Key Elements */}
            <div className="absolute top-20 left-24 w-6 h-6 bg-indigo-500/40 border border-indigo-400 rounded cursor-move flex items-center justify-center hover:scale-110 transition-transform">
              <span className="text-[7px] font-black text-white">K1</span>
            </div>
            <div className="absolute bottom-20 right-24 w-6 h-6 bg-emerald-500/40 border border-emerald-400 rounded cursor-move flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <span className="text-[7px] font-black text-white">K2</span>
            </div>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-md flex gap-5 shadow-xl transition-all">
            <button className="text-indigo-600 dark:text-indigo-400"><MousePointer2 className="w-4 h-4" /></button>
            <button className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"><Move className="w-4 h-4" /></button>
            <button className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center">Zoom: 100%</span>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-64 flex flex-col gap-5 shrink-0">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-5 shadow-sm transition-all">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Available Keys</h4>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all shadow-sm">
                      <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors">Target_{i}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">DRAG</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm transition-all">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3.5 transition-colors">Properties</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Snap to Grid</label>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                  <div className="w-2/3 h-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyLayoutPage;
