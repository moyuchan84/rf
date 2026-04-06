import React, { useState, useEffect, useRef } from 'react';
import { X, FileDiff, ArrowRight, Table } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { usePhotoKeyDiff, DiffRow } from '../hooks/usePhotoKeyDiff';

interface PhotoKeyDiffModalProps {
  baseId: number;
  targetId: number;
  baseTitle: string;
  targetTitle: string;
  onClose: () => void;
}

export const PhotoKeyDiffModal: React.FC<PhotoKeyDiffModalProps> = ({ 
  baseId, 
  targetId, 
  baseTitle, 
  targetTitle, 
  onClose 
}) => {
  const { diff, loading, error } = usePhotoKeyDiff(baseId, targetId);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diff && diff.length > 0 && !selectedSheet) {
      setSelectedSheet(diff[0].sheetName);
    }
  }, [diff, selectedSheet]);

  const syncScroll = (source: 'left' | 'right') => {
    if (source === 'left' && leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
      rightScrollRef.current.scrollLeft = leftScrollRef.current.scrollLeft;
    } else if (source === 'right' && leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
      leftScrollRef.current.scrollLeft = rightScrollRef.current.scrollLeft;
    }
  };

  const currentSheetDiff = diff?.find(s => s.sheetName === selectedSheet);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">분석 중 (Analyzing Diff)...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md">
          <h2 className="text-lg font-black text-red-600 mb-2">Error</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error.message}</p>
          <button onClick={onClose} className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <FileDiff className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">Workbook Comparison</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{baseTitle}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] font-bold text-indigo-500 uppercase truncate max-w-[200px]">{targetTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6 h-8">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#e6ffec] border border-green-200" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Added</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#ffebe9] border border-red-200" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Removed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#fff5b1] border border-yellow-200" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Modified</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sheet Selection */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto shrink-0 custom-scrollbar">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Worksheets</h3>
          <div className="space-y-1">
            {diff?.map((sheet) => (
              <button
                key={sheet.sheetName}
                onClick={() => setSelectedSheet(sheet.sheetName)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all group",
                  selectedSheet === sheet.sheetName 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Table className="w-3.5 h-3.5 shrink-0 opacity-50" />
                  <span className="text-[10px] font-black uppercase truncate">{sheet.sheetName}</span>
                </div>
                {sheet.status !== 'unchanged' && (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    sheet.status === 'added' ? "bg-green-500" :
                    sheet.status === 'removed' ? "bg-red-500" : "bg-yellow-500"
                  )} />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Diff Display Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedSheet && currentSheetDiff && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side (Base) */}
              <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="h-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BASE: {baseTitle}</span>
                </div>
                <div 
                  ref={leftScrollRef}
                  onScroll={() => syncScroll('left')}
                  className="flex-1 overflow-auto custom-scrollbar"
                >
                  <table className="w-full border-collapse text-[10px]">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 shadow-sm">
                      <tr>
                        <th className="w-10 border border-slate-200 dark:border-slate-800 p-2 text-slate-400 font-bold">#</th>
                        {/* Headers will be derived from data keys or metadata if available */}
                        {getColumns(currentSheetDiff.diffRows).map(col => (
                          <th key={col} className="border border-slate-200 dark:border-slate-800 p-2 text-left text-slate-600 dark:text-slate-400 font-black uppercase tracking-tighter min-w-[100px]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheetDiff.diffRows?.map((row: DiffRow, idx: number) => (
                        <tr 
                          key={idx}
                          className={cn(
                            "group transition-colors",
                            row.status === 'removed' ? "bg-[#ffebe9]" :
                            row.status === 'added' ? "bg-slate-50/50 opacity-20" :
                            row.status === 'modified' ? "bg-[#fff5b1]/20 hover:bg-[#fff5b1]/40" :
                            "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          )}
                        >
                          <td className="border border-slate-200 dark:border-slate-800 p-2 text-center font-bold text-slate-400 bg-slate-50/30">{idx + 1}</td>
                          {getColumns(currentSheetDiff.diffRows).map(col => {
                            const val = row.status === 'added' ? '' : (row.baseData || row.data)?.[col];
                            return (
                              <td key={col} className="border border-slate-200 dark:border-slate-800 p-2 font-medium text-slate-700 dark:text-slate-300">
                                {String(val ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side (Target) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TARGET: {targetTitle}</span>
                </div>
                <div 
                  ref={rightScrollRef}
                  onScroll={() => syncScroll('right')}
                  className="flex-1 overflow-auto custom-scrollbar"
                >
                  <table className="w-full border-collapse text-[10px]">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 shadow-sm">
                      <tr>
                        <th className="w-10 border border-slate-200 dark:border-slate-800 p-2 text-slate-400 font-bold">#</th>
                        {getColumns(currentSheetDiff.diffRows).map(col => (
                          <th key={col} className="border border-slate-200 dark:border-slate-800 p-2 text-left text-slate-600 dark:text-slate-400 font-black uppercase tracking-tighter min-w-[100px]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheetDiff.diffRows?.map((row: DiffRow, idx: number) => (
                        <tr 
                          key={idx}
                          className={cn(
                            "group transition-colors",
                            row.status === 'added' ? "bg-[#e6ffec]" :
                            row.status === 'removed' ? "bg-slate-50/50 opacity-20" :
                            row.status === 'modified' ? "bg-[#fff5b1] hover:bg-[#fff9d1]" :
                            "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          )}
                        >
                          <td className="border border-slate-200 dark:border-slate-800 p-2 text-center font-bold text-slate-400 bg-slate-50/30">{idx + 1}</td>
                          {getColumns(currentSheetDiff.diffRows).map(col => {
                            const val = row.status === 'removed' ? '' : row.data?.[col];
                            const isChanged = row.status === 'modified' && row.changedFields?.includes(col);
                            return (
                              <td 
                                key={col} 
                                className={cn(
                                  "border border-slate-200 dark:border-slate-800 p-2 font-medium text-slate-900 dark:text-slate-100",
                                  isChanged && "bg-yellow-400/30 ring-1 ring-yellow-400 ring-inset"
                                )}
                              >
                                {String(val ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to get columns from data
function getColumns(rows?: DiffRow[]): string[] {
  if (!rows || rows.length === 0) return [];
  const firstData = rows[0].data || rows[0].baseData;
  if (!firstData) return [];
  return Object.keys(firstData).filter(key => key.startsWith('col_') || key.toUpperCase() === 'ID' || key.toUpperCase() === 'KEY_ID');
}
