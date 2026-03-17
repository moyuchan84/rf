import React, { useState } from 'react';
import { type PhotoKey } from '../../master-data/types';
import { cn } from '@/shared/utils/cn';
import { Database, FileSpreadsheet, Download, ArrowLeft, Layers } from 'lucide-react';
import { ExcelRestoreService } from '../services/ExcelRestoreService';
import { useKeyTableStore } from '../store/useKeyTableStore';

export const PhotoKeyDetail: React.FC = () => {
  const { selectedKey, setSelectedKey } = useKeyTableStore();
  const workbook = selectedKey?.workbookData;
  const [activeSheet, setActiveSheet] = useState(workbook?.Worksheets?.[0]);

  const handleDownload = async () => {
    if (!selectedKey) return;
    try {
      await ExcelRestoreService.exportToExcel(selectedKey);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (!selectedKey || !workbook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all">
        <Database className="w-12 h-12 mb-3.5 opacity-[0.05] dark:opacity-20 transition-opacity" />
        <p className="text-xs font-black uppercase tracking-widest transition-colors">No detailed data available</p>
        <button onClick={() => setSelectedKey(null)} className="mt-5 text-indigo-600 dark:text-indigo-400 hover:underline text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 gap-5 overflow-hidden animate-in fade-in duration-300">
      {/* Detail Header */}
      <header className="flex justify-between items-end shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedKey(null)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">{selectedKey.tableName}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] transition-colors">Revision v{selectedKey.revNo} / {selectedKey.rfgCategory}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
        >
          <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Restore Excel</span>
        </button>
      </header>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Worksheets Navigation */}
        <aside className="w-56 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shrink-0 shadow-sm dark:shadow-xl transition-all">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-[8px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest transition-colors">Worksheets</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {workbook.Worksheets?.map((sheet: any, idx: number) => (
              <div 
                key={sheet.SheetName || idx}
                onClick={() => setActiveSheet(sheet)}
                className={cn(
                  "p-3 rounded-md cursor-pointer transition-all border border-transparent group",
                  activeSheet === sheet ? "bg-indigo-600 border-indigo-500/30 text-white shadow-md shadow-indigo-600/20" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-500"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-black truncate uppercase transition-colors">{sheet.SheetName}</span>
                  <span className={cn(
                    "text-[7px] font-black px-1 py-0.5 rounded-sm uppercase transition-colors",
                    activeSheet === sheet ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600"
                  )}>
                    {sheet.SheetType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Sheet Content Viewer */}
        <main className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col shadow-sm dark:shadow-xl relative transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none transition-all"></div>
          
          {activeSheet ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sheet Sub-header */}
              <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 shrink-0 transition-colors">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">{activeSheet.SheetName}</h3>
                </div>
                <div className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest transition-colors">
                  Origin: <span className="text-indigo-600 dark:text-indigo-400 font-mono">({activeSheet.Origin?.Row}, {activeSheet.Origin?.Col})</span>
                </div>
              </div>

              {/* Meta Info Bar */}
              {activeSheet.MetaInfo && Object.keys(activeSheet.MetaInfo).length > 0 && (
                <div className="p-3 bg-slate-50/30 dark:bg-slate-950/20 border-b border-slate-200/60 dark:border-slate-800/50 flex gap-3 overflow-x-auto custom-scrollbar shrink-0 transition-colors">
                  {Object.entries(activeSheet.MetaInfo).map(([key, val]: any) => (
                    <div key={key} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 min-w-[120px] shadow-sm transition-all">
                      <div className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase mb-0.5 transition-colors">{key}</div>
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate transition-colors">{val}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table Viewer */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 transition-colors">
                    <tr className="border-b border-slate-200/60 dark:border-slate-800/50 transition-colors">
                      <th className="p-3 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-12 text-center border-r border-slate-200/60 dark:border-slate-800/50 transition-colors">#</th>
                      {activeSheet.Columns?.map((col: any) => (
                        <th key={col.Key} className="p-3 border-r border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                          <div className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider transition-colors">{col.Name}</div>
                          <div className="text-[7px] font-bold text-slate-400 dark:text-slate-600 mt-0.5 transition-colors">{col.Key}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/30 text-[10px] font-medium text-slate-600 dark:text-slate-400 transition-colors">
                    {activeSheet.TableData?.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="p-3 text-center border-r border-slate-200/60 dark:border-r-slate-800/50 bg-slate-50/30 dark:bg-slate-950/10 text-slate-400 dark:text-slate-600 font-mono text-[9px] transition-colors">{rIdx + 1}</td>
                        {activeSheet.Columns?.map((col: any) => (
                          <td key={col.Key} className="p-3 border-r border-slate-200/60 dark:border-r-slate-800/30 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                            {row[col.Key] !== null ? String(row[col.Key]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
              <FileSpreadsheet className="w-12 h-12 mb-3.5 opacity-[0.05] dark:opacity-10 transition-opacity" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select a sheet to view</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
