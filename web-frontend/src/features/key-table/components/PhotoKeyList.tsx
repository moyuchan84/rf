import React from 'react';
import { Download, Database, Search, Filter } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { usePhotoKeys } from '../hooks/usePhotoKeys';
import { useKeyTableStore } from '../store/useKeyTableStore';
import { ExcelRestoreService } from '../services/ExcelRestoreService';
import type { PhotoKey } from '../../master-data/types';

interface PhotoKeyListProps {
  designRule?: string;
  optionName?: string;
  partId?: string;
}

export const PhotoKeyList: React.FC<PhotoKeyListProps> = ({ designRule, optionName, partId }) => {
  const { photoKeys, loading } = usePhotoKeys();
  const { setSelectedKey, selectedProductId } = useKeyTableStore();

  const handleDownload = async (e: React.MouseEvent, key: PhotoKey) => {
    e.stopPropagation();
    try {
      await ExcelRestoreService.exportToExcel(key);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 gap-6 overflow-hidden">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">Key Repository</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] transition-colors">Photo Key Database Inquiry</span>
            {partId && (
              <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest transition-colors">
                {designRule} / {optionName} / {partId}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 gap-3 focus-within:border-indigo-500/50 transition-all shadow-sm">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-600" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-48 placeholder:text-slate-400 dark:placeholder:text-slate-700"
            />
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden flex flex-col shadow-sm dark:shadow-2xl relative transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none transition-all"></div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : photoKeys.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 transition-colors">
                <tr className="border-b border-slate-200/60 dark:border-slate-800 transition-colors">
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Table Category</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Table Name</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Rev</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Last Updated</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors">
                {photoKeys.map((key) => (
                  <tr 
                    key={key.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedKey(key)}
                  >
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md border w-fit uppercase tracking-tighter transition-colors",
                          key.rfgCategory === 'common' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        )}>
                          {key.rfgCategory}
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-600 uppercase ml-1 transition-colors">{key.photoCategory}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{key.tableName}</span>
                        {key.isReference && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase transition-colors">Ref</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-indigo-600 dark:text-indigo-400 font-mono transition-colors">v{key.revNo}</td>
                    <td className="p-6 text-slate-400 dark:text-slate-500 font-medium transition-colors">
                      {new Date(key.updateDate).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={(e) => handleDownload(e, key)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 active:scale-95 group/btn"
                      >
                        <Download className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Excel</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40 transition-opacity">
              <Database className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-6 transition-colors" />
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">
                {selectedProductId ? "No key tables found for this product" : "Select a node to query key data"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
