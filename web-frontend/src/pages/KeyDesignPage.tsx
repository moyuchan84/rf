import React from 'react';
import { Palette, Plus } from 'lucide-react';

const KeyDesignPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">키디자인</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Manage Photo Key Blueprints</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          NEW DESIGN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group shadow-sm dark:shadow-lg">
            <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-md mb-5 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 group-hover:border-indigo-500/20 transition-all shadow-sm">
              <Palette className="w-10 h-10 text-slate-300 dark:text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-500/50 transition-colors" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-xs mb-1 transition-colors">Key_Type_{i}</h3>
            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold truncate mb-3.5 transition-colors">Description for the photo key design {i}</p>
            <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded transition-colors">V1.2</span>
              <button className="text-[9px] font-black text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white uppercase tracking-widest transition-colors">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyDesignPage;
