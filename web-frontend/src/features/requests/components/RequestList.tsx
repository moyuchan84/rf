import React from 'react';
import { Search, Filter, List, Plus } from 'lucide-react';
import { RequestItemCard } from './RequestItemCard';
import { type RequestItem } from '../../master-data/types';

interface RequestListProps {
  requests: RequestItem[];
  loading: boolean;
  onRequestClick: (req: RequestItem) => void;
  onEditClick: (e: React.MouseEvent, req: RequestItem) => void;
  onDeleteClick: (e: React.MouseEvent, id: number) => void;
  onCreateClick: () => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  loading,
  onRequestClick,
  onEditClick,
  onDeleteClick,
  onCreateClick
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex gap-4 p-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl transition-all">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search requests by title, product, or requester..."
            className="w-full bg-transparent pl-14 pr-6 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-colors"
          />
        </div>
        <button className="px-6 py-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-3 active:scale-95 shadow-sm">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 text-center shadow-sm transition-all">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((req) => (
            <RequestItemCard 
              key={req.id}
              request={req}
              onClick={onRequestClick}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative transition-all">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none transition-all"></div>
          <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-10 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl relative z-10 transition-all">
            <List className="text-slate-300 dark:text-slate-800 w-16 h-16 transition-colors" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-[0.5em] relative z-10 transition-colors">System is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs leading-relaxed font-bold mb-12 relative z-10 uppercase tracking-widest transition-colors">
            No active photo-key requests detected in the repository. Initiate a new submission to begin.
          </p>
          <button 
            onClick={onCreateClick}
            className="group relative z-10 flex items-center gap-4 px-10 py-5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600/50 shadow-sm dark:shadow-2xl"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-500 group-hover:scale-125 transition-transform" />
            Initiate First Request
          </button>
        </div>
      )}
    </div>
  );
};
