import React, { useMemo, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { 
  Database, 
  FileSpreadsheet, 
  Download, 
  ArrowLeft, 
  History, 
  User, 
  Calendar, 
  Info,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Clock
} from 'lucide-react';
import { useKeyTableStore } from '../store/useKeyTableStore';
import { PhotoKey } from '../../master-data/types';

export const PhotoKeyDetail: React.FC = () => {
  const { selectedKey, setSelectedKey, photoKeys } = useKeyTableStore();
  const workbook = selectedKey?.workbookData as any;
  
  // null represents "Version Info / Log" view
  const [activeSheet, setActiveSheet] = useState<any | null>(null);

  // Filter versions for the currently selected table
  const currentTableVersions = useMemo(() => {
    if (!selectedKey) return [];
    return photoKeys
      .filter(k => k.tableName === selectedKey.tableName && k.photoCategory === selectedKey.photoCategory)
      .sort((a, b) => (b.revNo || 0) - (a.revNo || 0));
  }, [photoKeys, selectedKey]);

  const handleDownload = async () => {
    if (!selectedKey) return;
    
    // Direct download from NestJS REST API
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999';
    const downloadUrl = `${baseUrl}/download/photo-key/${selectedKey.id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${selectedKey.tableName}_Rev${selectedKey.revNo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-800/50">
                {selectedKey.rfgCategory}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest transition-colors">
                {selectedKey.photoCategory}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">
              {selectedKey.tableName}
              <span className="ml-2 text-indigo-500 font-mono text-lg">v{selectedKey.revNo}</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
          >
            <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Restore Excel</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 flex flex-col gap-5 shrink-0 overflow-hidden">
          <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shadow-sm dark:shadow-xl transition-all">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
              <History className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-[8px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest transition-colors">Version History</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {currentTableVersions.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedKey(v);
                    setActiveSheet(null);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-md transition-all text-[10px] font-black uppercase group",
                    selectedKey.id === v.id 
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className={cn("w-3.5 h-3.5", selectedKey.id === v.id ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-400")} />
                    <div className="flex flex-col items-start">
                      <span>Rev.{v.revNo}</span>
                      <span className="text-[7px] text-slate-400 font-bold tracking-tighter lowercase">
                        {new Date(v.updateDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {selectedKey.id === v.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Worksheets for Selected Key */}
          <div className="h-48 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shadow-sm transition-all">
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/30">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[8px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Worksheets</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <div 
                onClick={() => setActiveSheet(null)}
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-all flex items-center gap-2",
                  activeSheet === null ? "bg-slate-900 dark:bg-slate-800 text-white shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500"
                )}
              >
                <History className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase">Version Log</span>
              </div>
              {workbook.Worksheets?.map((sheet: any, idx: number) => (
                <div 
                  key={sheet.SheetName || idx}
                  onClick={() => setActiveSheet(sheet)}
                  className={cn(
                    "p-2 rounded-md cursor-pointer transition-all flex items-center justify-between gap-1.5",
                    activeSheet === sheet ? "bg-emerald-600 text-white shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500"
                  )}
                >
                  <span className="text-[9px] font-black truncate uppercase">{sheet.SheetName}</span>
                  <span className="text-[6px] opacity-60 font-black uppercase">{sheet.SheetType}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col shadow-sm dark:shadow-xl relative transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none transition-all"></div>
          
          {activeSheet === null ? (
            /* VERSION INFO / LOG VIEW */
            <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-2 duration-300">
              <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/50 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Version Info & Log</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Meta Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5 tracking-widest">Last Updated By</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedKey.updater}</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5 tracking-widest">Updated Date</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {new Date(selectedKey.updateDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 flex items-center justify-between">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Change Log Detail</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Rev. v{selectedKey.revNo}</span>
                    </div>
                    <div className="p-8">
                      <div 
                        className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium whitespace-pre-wrap"
                      >
                        {selectedKey.log || "No update details provided for this version."}
                      </div>
                    </div>
                  </div>

                  {/* Workbook Stats */}
                  <div className="bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex justify-around text-center">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Total Sheets</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">{workbook.Worksheets?.length || 0}</span>
                    </div>
                    <div className="w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Original Filename</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{selectedKey.filename}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DATA SHEET VIEW */
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
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
                      <tr key={rIdx} className="hover:bg-indigo-50/5 transition-colors group">
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
          )}
        </main>
      </div>
    </div>
  );
};
