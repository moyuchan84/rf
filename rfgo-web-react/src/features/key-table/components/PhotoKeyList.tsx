import React from 'react';
import { Download, Database, Search, Filter } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { usePhotoKeys } from '../hooks/usePhotoKeys';
import { usePhotoKeyDownload } from '../hooks/usePhotoKeyDownload';
import { useKeyTableStore } from '../store/useKeyTableStore';
import type { PhotoKey } from '../../master-data/types';

interface PhotoKeyListProps {
  designRule?: string;
  optionName?: string;
  partId?: string;
}

export const PhotoKeyList: React.FC<PhotoKeyListProps> = ({ designRule, optionName, partId }) => {
  const { photoKeys, loading } = usePhotoKeys();
  const { downloadBinary, isDownloading } = usePhotoKeyDownload();
  const { setSelectedKey, selectedProductId } = useKeyTableStore();

  const handleDownload = async (e: React.MouseEvent, key: PhotoKey) => {
    e.stopPropagation();
    await downloadBinary(key);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 gap-5 overflow-hidden">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">키테이블</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] transition-colors">Photo Key Database Inquiry</span>
            {partId && (
              <div className="flex items-center gap-1.5 text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-sm border border-indigo-500/20 uppercase tracking-widest transition-colors">
                {designRule} / {optionName} / {partId}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 gap-2.5 focus-within:border-indigo-500/50 transition-all shadow-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 dark:text-white w-40 placeholder:text-slate-400 dark:placeholder:text-slate-700"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col shadow-sm dark:shadow-xl relative transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none transition-all"></div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : photoKeys.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 transition-colors">
                <tr className="border-b border-slate-200/60 dark:border-slate-800 transition-colors">
                  <th className="p-5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Table Category</th>
                  <th className="p-5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Table Name</th>
                  <th className="p-5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Rev</th>
                  <th className="p-5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Last Updated</th>
                  <th className="p-5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors">
                {photoKeys.map((key) => (
                  <tr 
                    key={key.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedKey(key)}
                  >
                    <td className="p-5">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-sm border w-fit uppercase tracking-tighter transition-colors",
                          key.rfgCategory === 'common' ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        )}>
                          {key.rfgCategory}
                        </span>
                        <span className="text-[7px] text-slate-400 dark:text-slate-600 uppercase ml-0.5 transition-colors">{key.photoCategory}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{key.tableName}</span>
                        {key.isReference && (
                          <span className="text-[7px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 px-1 py-0.5 rounded-sm uppercase transition-colors">Ref</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-indigo-600 dark:text-indigo-400 font-mono transition-colors">v{key.revNo}</td>
                    <td className="p-5 text-slate-400 dark:text-slate-500 font-medium transition-colors">
                      {new Date(key.updateDate).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <button 
                        onClick={(e) => handleDownload(e, key)}
                        disabled={isDownloading(key.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all border active:scale-95 group/btn min-w-[70px] justify-center",
                          isDownloading(key.id) 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            : "bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white border-indigo-500/20"
                        )}
                      >
                        {isDownloading(key.id) ? (
                          <div className="w-3 h-3 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        ) : (
                          <>
                            <Download className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Excel</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-40 transition-opacity">
              <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-5 transition-colors" />
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">
                {selectedProductId ? "No key tables found for this product" : "Select a node to query key data"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
