import React from 'react';
import { Palette, Plus } from 'lucide-react';

const KeyDesignPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Key Design</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Manage Photo Key Blueprints</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          NEW DESIGN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group shadow-sm dark:shadow-xl">
            <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl mb-6 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 group-hover:border-indigo-500/20 transition-all shadow-sm">
              <Palette className="w-12 h-12 text-slate-300 dark:text-slate-800 group-hover:text-indigo-600 dark:group-hover:text-indigo-500/50 transition-colors" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-sm mb-1 transition-colors">Key_Type_{i}</h3>
            <p className="text-slate-500 dark:text-slate-500 text-xs font-bold truncate mb-4 transition-colors">Description for the photo key design {i}</p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded transition-colors">V1.2</span>
              <button className="text-[10px] font-black text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white uppercase tracking-widest transition-colors">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyDesignPage;
