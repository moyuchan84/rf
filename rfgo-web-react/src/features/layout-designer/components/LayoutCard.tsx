import React from 'react';
import { Layers, Edit3, Trash2, Calendar, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface LayoutCardProps {
  layout: any;
  onEdit: (layout: any) => void;
  onDelete: (id: number) => void;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ layout, onEdit, onDelete }) => {
  return (
    <article className="group bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-md p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-lg hover:shadow-md cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/[0.02] dark:bg-indigo-600/[0.04] blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors group-hover:border-indigo-500">
          <Layers className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-white transition-colors" />
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(layout); }}
            className="p-1.5 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(layout.id); }}
            className="p-1.5 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md text-slate-400 hover:text-red-600 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative z-10" onClick={() => onEdit(layout)}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[7px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-indigo-500/20">ID-{layout.id}</span>
          {layout.config?.strategy && (
            <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-500/20">{layout.config.strategy}</span>
          )}
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate mb-3">{layout.title}</h3>
        
        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Created</span>
            <span className="text-slate-600 dark:text-slate-300">{new Date(layout.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Updated</span>
            <span className="text-slate-600 dark:text-slate-300">{new Date(layout.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default LayoutCard;
