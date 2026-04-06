import React from 'react';
import { Search, Table, Clock, ArrowRightLeft, Database } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTableCompare } from '../hooks/useTableCompare';

export const TableCompareSelector: React.FC = () => {
  const {
    tableNames,
    loadingNames,
    selectedTableName,
    setSelectedTableName,
    searchQuery,
    setSearchQuery,
    tableRevisions,
    loadingRevisions,
    selectedIds,
    toggleIdSelection,
    executeCompare
  } = useTableCompare();

  return (
    <div className="h-full flex flex-col min-w-0 gap-6 p-6 overflow-hidden">
      <header className="flex flex-col gap-1 shrink-0">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">키테이블 비교 (Table Comparison)</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select a table and two revisions to analyze differences</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
        {/* Step 1: Search & Table List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm min-h-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search table name..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loadingNames ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : tableNames.length > 0 ? (
              <div className="space-y-1">
                {tableNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedTableName(name)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group",
                      selectedTableName === name 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <Table className={cn("w-4 h-4", selectedTableName === name ? "text-white" : "text-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase truncate">{name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 opacity-20">
                <Database className="w-10 h-10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No results</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Revision List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Revision History</h3>
              {selectedTableName && <p className="text-[9px] font-bold text-indigo-500 uppercase">{selectedTableName}</p>}
            </div>
            <button
              onClick={executeCompare}
              disabled={selectedIds.length !== 2}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Compare ({selectedIds.length}/2)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingRevisions ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : !selectedTableName ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Clock className="w-12 h-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Select a table from the list</p>
              </div>
            ) : tableRevisions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tableRevisions.map(v => {
                  const isSelected = selectedIds.includes(v.id);
                  const selectOrder = selectedIds.indexOf(v.id) + 1;

                  return (
                    <div
                      key={v.id}
                      onClick={() => toggleIdSelection(v.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 group",
                        isSelected 
                          ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-md" 
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/30 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500"
                          )}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Rev.{v.revNo}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(v.updateDate).toLocaleString()}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                            <span className="text-[9px] font-black text-white">{selectOrder}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate italic font-medium">{v.filename}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Database className="w-12 h-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">No revisions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
