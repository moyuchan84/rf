import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_REQUEST_TABLES } from '../api/requestQueries';
import { 
  GetRequestTablesQuery, 
  GetRequestTablesQueryVariables 
} from '@/shared/api/generated/graphql';
import { 
  Database, 
  FileSpreadsheet, 
  History, 
  User, 
  Calendar,
  LayoutGrid,
  Info,
  Download,
  Zap
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { PhotoKey } from '@/features/master-data/types';
import { usePhotoKeyDownload } from '@/features/key-table/hooks/usePhotoKeyDownload';

interface RequestKeyTableResultProps {
  requestId: number;
}

export const RequestKeyTableResult: React.FC<RequestKeyTableResultProps> = ({ requestId }) => {
  const { downloadBinary, isDownloading } = usePhotoKeyDownload();
  const { data, loading } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(
    GET_REQUEST_TABLES, 
    {
      variables: { requestId, type: 'SETUP' },
      fetchPolicy: 'network-only'
    }
  );

  const selectedTables = useMemo(() => {
    return (data?.requestTables?.map((rt: any) => rt.photoKey).filter(Boolean) || []) as PhotoKey[];
  }, [data]);

  const [selectedKey, setSelectedKey] = useState<PhotoKey | null>(null);
  const [activeSheet, setActiveSheet] = useState<any | null>(null);

  // Set first table as default if none selected
  React.useEffect(() => {
    if (selectedTables.length > 0 && !selectedKey) {
      setSelectedKey(selectedTables[0]);
    }
  }, [selectedTables, selectedKey]);

  const workbook = selectedKey?.workbookData as any;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Resulting Tables...</span>
        </div>
      </div>
    );
  }

  if (selectedTables.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Key Table Setup Result</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configuration finalized for this request</p>
        </div>
      </div>

      <div className="flex gap-6 h-[700px]">
        {/* Navigation Sidebar */}
        <aside className="w-72 flex flex-col gap-6 shrink-0">
          {/* List of Selected Tables */}
          <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shadow-sm transition-all">
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[9px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Setup Tables</span>
              </div>
              <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase">
                {selectedTables.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {selectedTables.map(key => (
                <div key={key.id} className="relative group/item">
                  <button
                    onClick={() => {
                      setSelectedKey(key);
                      setActiveSheet(null);
                    }}
                    className={cn(
                      "w-full flex flex-col items-start p-3 pr-10 rounded-md transition-all group border text-left",
                      selectedKey?.id === key.id 
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-sm" 
                        : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5 w-full">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        key.photoCategory === 'ALIGN' ? 'bg-amber-400' : 'bg-sky-400'
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase truncate flex-1",
                        selectedKey?.id === key.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {key.tableName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                        REV.{key.revNo}
                      </span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(key.updateDate).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadBinary(key);
                    }}
                    disabled={isDownloading(key.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all opacity-0 group-hover/item:opacity-100 disabled:opacity-50 shadow-sm"
                    title="Download Excel"
                  >
                    {isDownloading(key.id) ? (
                      <Zap className="w-3 h-3 animate-pulse text-indigo-500" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Worksheets for Selected Table */}
          {selectedKey && (
            <div className="h-64 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shadow-sm transition-all">
              <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/30">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Worksheets</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                <button 
                  onClick={() => setActiveSheet(null)}
                  className={cn(
                    "w-full p-2.5 rounded-md cursor-pointer transition-all flex items-center gap-2.5 text-left border",
                    activeSheet === null 
                      ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-800 shadow-md" 
                      : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500"
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase">Version Log</span>
                </button>
                {workbook?.Worksheets?.map((sheet: any, idx: number) => (
                  <button 
                    key={sheet.SheetName || idx}
                    onClick={() => setActiveSheet(sheet)}
                    className={cn(
                      "w-full p-2.5 rounded-md cursor-pointer transition-all flex items-center justify-between gap-2 text-left border",
                      activeSheet === sheet 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                        : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500"
                    )}
                  >
                    <span className="text-[9px] font-black truncate uppercase">{sheet.SheetName}</span>
                    <span className="text-[6px] opacity-60 font-black uppercase px-1 py-0.5 bg-black/10 rounded">{sheet.SheetType}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col shadow-sm dark:shadow-xl relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/[0.02] dark:bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
          
          {!selectedKey ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-40">
              <Database className="w-16 h-16 mb-4 stroke-1" />
              <p className="text-[10px] font-black uppercase tracking-widest">Select a table to view details</p>
            </div>
          ) : activeSheet === null ? (
            /* VERSION LOG VIEW */
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Table Information</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{selectedKey.tableName} v{selectedKey.revNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadBinary(selectedKey)}
                  disabled={isDownloading(selectedKey.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-md shadow-md shadow-indigo-600/20 transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  {isDownloading(selectedKey.id) ? (
                    <>
                      <Zap className="w-3 h-3 animate-pulse" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Meta Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Finalized By</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedKey.updater || 'SYSTEM'}</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                        <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Update Date</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {new Date(selectedKey.updateDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Info */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Category</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{selectedKey.photoCategory}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Worksheets</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{workbook?.Worksheets?.length || 0} Sheets</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Source File</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate block max-w-full px-2" title={selectedKey.filename || undefined}>
                        {selectedKey.filename}
                      </span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/30 dark:bg-indigo-900/10 border border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-8 flex items-start gap-5">
                    <Info className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">Setup Context</h4>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        This table has been selected as part of the setup configuration for Request #{requestId}. 
                        It contains critical parameters for the photo process alignment and verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DATA SHEET VIEW */
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{activeSheet.SheetName}</h3>
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Origin: <span className="text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-mono">R{activeSheet.Origin?.Row} C{activeSheet.Origin?.Col}</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="sticky top-0 bg-white dark:bg-slate-950 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-16 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">#</th>
                      {activeSheet.Columns?.map((col: any) => (
                        <th key={col.Key} className="p-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">{col.Name}</div>
                          <div className="text-[8px] font-bold text-slate-400 dark:text-slate-600 font-mono uppercase tracking-tighter">{col.Key}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {activeSheet.TableData?.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-500/5 transition-colors group">
                        <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-slate-400 font-mono text-[10px]">{rIdx + 1}</td>
                        {activeSheet.Columns?.map((col: any) => (
                          <td key={col.Key} className="p-4 border-r border-slate-200/60 dark:border-slate-800/50 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
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
    </section>
  );
};
