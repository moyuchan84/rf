import React from 'react';
import { UserApprovalPath } from '../../types';
import { Edit2, Trash2, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface PathGroupCardProps {
  path: UserApprovalPath;
  onEdit: (path: UserApprovalPath) => void;
  onDelete: (id: number) => void;
}

export const PathGroupCard: React.FC<PathGroupCardProps> = ({ path, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-4 hover:shadow-xl dark:hover:shadow-indigo-50/5 hover:border-indigo-500/30 transition-all group/card flex flex-col h-full shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 group-hover/card:bg-indigo-600 transition-colors duration-500 text-indigo-600 dark:text-indigo-400 group-hover/card:text-white">
            <ShieldCheck className="w-4 h-4 transition-colors" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tighter">{path.pathName}</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{path.pathItems?.length || 0} Approvers</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(path)} 
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-all"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onDelete(path.id)} 
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar content-start">
        {path.pathItems?.map((m, idx) => (
          <div key={m.epId || idx} className="flex items-center gap-2 group/item">
            <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 w-3">#{idx + 1}</span>
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 group-hover/item:text-indigo-600 transition-colors truncate">
              {m.fullName}
            </span>
            <span className={cn(
              "text-[7px] px-1 rounded-sm font-black uppercase shrink-0",
              m.role === '0' ? "bg-amber-100 text-amber-600" : m.role === '1' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            )}>
              {m.role === '0' ? '기안' : m.role === '1' ? '결재' : m.role === '2' ? '합의' : m.role === '9' ? '통보' : '수신'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter italic">Personal Template</span>
        <ChevronRight className="w-3 h-3 text-slate-200 group-hover/card:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
