import React from 'react';
import { Layers, MousePointer2, Move, Maximize2, Save } from 'lucide-react';

const KeyLayoutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Photo Key Layout</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Reticle Placement Designer</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
            Auto Arrange
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">
            <Save className="w-4 h-4" />
            Save Layout
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Editor Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[3rem] relative overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          
          {/* Canvas Placeholder */}
          <div className="w-[600px] h-[400px] border-2 border-indigo-500/30 rounded-xl relative bg-slate-950/80 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-20">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-slate-800"></div>
              ))}
            </div>
            
            {/* Mock Reticle Area */}
            <div className="absolute inset-20 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Reticle_Boundary</span>
            </div>

            {/* Mock Key Elements */}
            <div className="absolute top-24 left-32 w-8 h-8 bg-indigo-500/40 border border-indigo-400 rounded cursor-move flex items-center justify-center hover:scale-110 transition-transform">
              <span className="text-[8px] font-black text-white">K1</span>
            </div>
            <div className="absolute bottom-24 right-32 w-8 h-8 bg-emerald-500/40 border border-emerald-400 rounded cursor-move flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <span className="text-[8px] font-black text-white">K2</span>
            </div>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex gap-6 shadow-2xl">
            <button className="text-indigo-400"><MousePointer2 className="w-5 h-5" /></button>
            <button className="text-slate-500 hover:text-white"><Move className="w-5 h-5" /></button>
            <button className="text-slate-500 hover:text-white"><Maximize2 className="w-5 h-5" /></button>
            <div className="w-px h-5 bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">Zoom: 100%</span>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Available Keys</h4>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">Target_{i}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-400 transition-colors">DRAG</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Properties</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Snap to Grid</label>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
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
