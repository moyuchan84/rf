import React from 'react';
import { Layers, FileSearch } from 'lucide-react';
import { useReferenceTableStore } from '../../../store/useReferenceTableStore';

export const ScenarioSelector: React.FC = () => {
  const { scenario, setScenario } = useReferenceTableStore();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
      <button
        onClick={() => setScenario('STREAM')}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
          scenario === 'STREAM'
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <FileSearch className="w-3 h-3" />
        Stream Search
      </button>
      <button
        onClick={() => setScenario('PROCESS')}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
          scenario === 'PROCESS'
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Layers className="w-3 h-3" />
        Process Hierarchy
      </button>
    </div>
  );
};
