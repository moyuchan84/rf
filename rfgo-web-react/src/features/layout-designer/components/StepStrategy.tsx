import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';

interface StepStrategyProps {
  onAutoArrange: () => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ onAutoArrange }) => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0 text-slate-900 dark:text-white">
        <LayoutGrid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-black uppercase tracking-widest">Placement Strategy</h3>
      </div>
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner transition-colors">
          <LayoutCanvas />
        </div>
        <div className="w-72 space-y-4 overflow-y-auto pr-2 shrink-0">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors">
            <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Algorithm</h4>
            <div className="space-y-2">
              {['UNIFORM_LINEAR', 'GREEDY_GRID', 'BEST_FIT'].map((s) => (
                <button
                  key={s}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-left text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-500 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={onAutoArrange}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              Run Placement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
