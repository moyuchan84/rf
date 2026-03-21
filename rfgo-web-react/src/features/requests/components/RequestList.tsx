import React, { useState } from 'react';
import { Search, Filter, List, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { RequestItemCard } from './RequestItemCard';
import { type RequestItem } from '../../master-data/types';
import { useMasterData } from '@/features/master-data/hooks/useMasterData';
import { REQUEST_TYPE_OPTIONS } from '../types';

interface RequestListProps {
  requestsList: any;
  onRequestClick: (req: RequestItem) => void;
  onEditClick: (e: React.MouseEvent, req: RequestItem) => void;
  onDeleteClick: (e: React.MouseEvent, id: number) => void;
  onCreateClick: () => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requestsList,
  onRequestClick,
  onEditClick,
  onDeleteClick,
  onCreateClick
}) => {
  const {
    requests,
    loading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalCount,
    requestType,
    setRequestType,
    processPlanId,
    setProcessPlanId,
    beolOptionId,
    setBeolOptionId
  } = requestsList;

  const { processPlans } = useMasterData();
  const [showFilters, setShowFilters] = useState(false);

  const selectedPlan = processPlans.find(p => p.id === processPlanId);
  const availableOptions = selectedPlan?.beolOptions || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-3 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl transition-all">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Title, Name or Knox ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 pl-12 pr-5 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-md outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 border rounded-md transition-all flex items-center gap-2.5 active:scale-95 shadow-sm ${
              showFilters || requestType || processPlanId 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Filter</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Request Type</label>
              <select 
                value={requestType || ''}
                onChange={(e) => setRequestType(e.target.value || null)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">ALL TYPES</option>
                {REQUEST_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Process Plan</label>
              <select 
                value={processPlanId || ''}
                onChange={(e) => setProcessPlanId(Number(e.target.value) || null)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">ALL PLANS</option>
                {processPlans.map(p => (
                  <option key={p.id} value={p.id}>{p.designRule}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1">BEOL Option</label>
              <select 
                value={beolOptionId || ''}
                onChange={(e) => setBeolOptionId(Number(e.target.value) || null)}
                disabled={!processPlanId}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">ALL OPTIONS</option>
                {availableOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.optionName}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-20 text-center shadow-sm transition-all">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="grid gap-5">
            {requests.map((req: RequestItem) => (
              <RequestItemCard 
                key={req.id}
                request={req}
                onClick={onRequestClick}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Showing {requests.length} of {totalCount} Requests
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Page {page} / {totalPages || 1}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || totalPages === 0 || loading}
                  className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-10 relative transition-all">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none transition-all"></div>
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-md flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all relative z-10">
            <List className="text-slate-300 dark:text-slate-800 w-12 h-12 transition-colors" />
          </div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white mb-3 uppercase tracking-[0.5em] relative z-10 transition-colors">No Requests Found</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 max-w-xs leading-relaxed font-bold mb-10 relative z-10 uppercase tracking-widest transition-colors">
            {search || requestType || processPlanId 
              ? "No requests match your current filter criteria. Try adjusting your filters."
              : "No active photo-key requests detected in the repository. Initiate a new submission to begin."}
          </p>
          <button 
            onClick={onCreateClick}
            className="group relative z-10 flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white rounded-md font-black text-[8px] uppercase tracking-[0.3em] transition-all active:scale-95 border border-slate-200 dark:border-slate-800 hover:border-indigo-600/50 shadow-sm dark:shadow-xl"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500 group-hover:scale-125 transition-transform" />
            Initiate First Request
          </button>
        </div>
      )}
    </div>
  );
};
