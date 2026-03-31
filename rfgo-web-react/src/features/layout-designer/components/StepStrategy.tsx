import React from 'react';
import { LayoutGrid, Target, Zap } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { useLayoutStore } from '../store/useLayoutStore';
import { cn } from '@/shared/utils/cn';

interface StepStrategyProps {
  onAutoArrange: () => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ onAutoArrange }) => {
  const { config, setConfig, placements } = useLayoutStore();

  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">Placement Strategy</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-md">
          <Target className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Elements: {placements.length}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner transition-colors">
          <LayoutCanvas />
        </div>

        <div className="w-80 space-y-4 overflow-y-auto pr-2 shrink-0 custom-scrollbar">
          {/* Configuration Card */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm transition-colors">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Number of Elements</label>
              <input 
                type="number"
                value={config.n}
                onChange={(e) => setConfig({ n: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Algorithm</label>
              <div className="grid grid-cols-1 gap-2">
                {(['UNIFORM_LINEAR', 'GREEDY_GRID', 'BEST_FIT_BIN_PACKING'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setConfig({ strategy: s })}
                    className={cn(
                      "w-full p-3 border rounded-md text-left text-[10px] font-black transition-all shadow-sm flex items-center justify-between group",
                      config.strategy === s 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50"
                    )}
                  >
                    {s.replace(/_/g, ' ')}
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      config.strategy === s ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-400"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onAutoArrange}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Run Placement
            </button>
          </div>

          {/* Guidelines */}
          <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-md">
            <h5 className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Instructions</h5>
            <ul className="text-[9px] font-bold text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Select target count and algorithm</li>
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Click 'Run Placement' to auto-generate</li>
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Drag circles on canvas to fine-tune</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
