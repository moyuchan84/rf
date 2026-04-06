import React, { useMemo, useState } from 'react';
import { 
  Download, 
  Database, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Clock,
  LayoutGrid,
  FileSpreadsheet,
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { usePhotoKeys } from '../hooks/usePhotoKeys';
import { usePhotoKeyDownload } from '../hooks/usePhotoKeyDownload';
import { useKeyTableStore } from '../store/useKeyTableStore';
import type { PhotoKey } from '../../master-data/types';
import { PhotoKeyDiffModal } from './PhotoKeyDiffModal';

interface PhotoKeyListProps {
  designRule?: string;
  optionName?: string;
  partId?: string;
}

export const PhotoKeyList: React.FC<PhotoKeyListProps> = ({ designRule, optionName, partId }) => {
  const { photoKeys, loading } = usePhotoKeys();
  const { downloadBinary, downloadBulk, isDownloading, isBulkDownloading } = usePhotoKeyDownload();
  const { setSelectedKey, selectedProductId, selectedKey } = useKeyTableStore();
  
  const [searchQuery, setSearchBarQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  
  // Selection State for Comparison
  const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);

  // Comparison State for Modal
  const [compareTarget, setCompareTarget] = useState<{
    baseId: number;
    targetId: number;
    baseTitle: string;
    targetTitle: string;
  } | null>(null);

  const toggleCompareSelection = (id: number) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleSelectedCompare = () => {
    if (selectedCompareIds.length === 2) {
      const v1 = photoKeys.find(k => k.id === selectedCompareIds[0]);
      const v2 = photoKeys.find(k => k.id === selectedCompareIds[1]);
      if (v1 && v2) {
        // Sort by revNo to set lower as base
        const [base, target] = (v1.revNo || 0) < (v2.revNo || 0) ? [v1, v2] : [v2, v1];
        setCompareTarget({
          baseId: base.id,
          targetId: target.id,
          baseTitle: `${base.tableName} (Rev.${base.revNo})`,
          targetTitle: `${target.tableName} (Rev.${target.revNo})`
        });
      }
    }
  };

  // Group and Filter Logic
  const nestedHierarchy = useMemo(() => {
    const filtered = photoKeys.filter(k => 
      k.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.photoCategory?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups: Record<string, Record<string, PhotoKey[]>> = {};
    filtered.forEach(key => {
      const cat = key.photoCategory || 'UNCLASSIFIED';
      const name = key.tableName || 'UNKNOWN';
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][name]) groups[cat][name] = [];
      groups[cat][name].push(key);
    });

    // Sort revNo descending
    Object.keys(groups).forEach(cat => {
      Object.keys(groups[cat]).forEach(name => {
        groups[cat][name].sort((a, b) => (b.revNo || 0) - (a.revNo || 0));
      });
    });
    return groups;
  }, [photoKeys, searchQuery]);

  const toggleExpand = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleDownload = async (e: React.MouseEvent, key: PhotoKey) => {
    e.stopPropagation();
    await downloadBinary(key);
  };

  const handleBulkDownload = async () => {
    const latestVersions: PhotoKey[] = [];
    Object.values(nestedHierarchy).forEach(catTables => {
      Object.values(catTables).forEach(versions => {
        if (versions.length > 0) latestVersions.push(versions[0]);
      });
    });
    
    if (latestVersions.length > 0) {
      await downloadBulk(latestVersions);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 gap-5 overflow-hidden">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">키테이블 탐색기</h2>
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
          {selectedCompareIds.length > 0 && (
            <button 
              onClick={handleSelectedCompare}
              disabled={selectedCompareIds.length !== 2}
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md shadow-md shadow-amber-600/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Compare Selected ({selectedCompareIds.length}/2)
            </button>
          )}
          {Object.keys(nestedHierarchy).length > 0 && (
            <button 
              onClick={handleBulkDownload}
              disabled={isBulkDownloading}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-md shadow-md shadow-indigo-600/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              {isBulkDownloading ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  Zipping...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download All (.ZIP)
                </>
              )}
            </button>
          )}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 gap-2.5 focus-within:border-indigo-500/50 transition-all shadow-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchBarQuery(e.target.value)}
              placeholder="Search by category or table..." 
              className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 dark:text-white w-48 placeholder:text-slate-400 dark:placeholder:text-slate-700"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm active:scale-95">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden flex flex-col shadow-sm dark:shadow-xl relative transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none transition-all"></div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : Object.keys(nestedHierarchy).length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {Object.entries(nestedHierarchy).map(([category, tables]) => (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-2 z-10">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <LayoutGrid className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{category}</h3>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{Object.keys(tables).length} Unique Tables</p>
                    </div>
                    <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                  </div>

                  {/* Table Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(tables).map(([tableName, versions]) => {
                      const isExpanded = expandedTables[tableName];
                      const latestVersion = versions[0];
                      const isActive = versions.some(v => v.id === selectedKey?.id);

                      return (
                        <div 
                          key={tableName} 
                          className={cn(
                            "border rounded-xl transition-all overflow-hidden flex flex-col",
                            isActive 
                              ? "border-indigo-500/50 bg-indigo-50/10 dark:bg-indigo-900/5 shadow-md" 
                              : "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700"
                          )}
                        >
                          {/* Table Main Row */}
                          <div 
                            className="p-5 flex flex-col gap-4 cursor-pointer"
                            onClick={() => setSelectedKey(latestVersion)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                <div className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                  category === 'ALIGN' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" : "bg-sky-100 text-sky-600 dark:bg-sky-900/30"
                                )}>
                                  <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{tableName}</h4>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Latest: Rev.{latestVersion.revNo}</span>
                                </div>
                              </div>
                              <button 
                                className="text-slate-300 hover:text-indigo-500 mt-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(tableName);
                                }}
                              >
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black tracking-wider">
                                  {versions.length} REVISIONS
                                </span>
                                {latestVersion.isReference && (
                                  <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">Reference</span>
                                )}
                              </div>
                              <span className="text-[9px] font-bold text-slate-400">{new Date(latestVersion.updateDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Version Dropdown */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-black/20 animate-in slide-in-from-top-2 duration-200">
                              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {versions.map(v => (
                                  <div 
                                    key={v.id}
                                    onClick={() => setSelectedKey(v)}
                                    className={cn(
                                      "flex items-center justify-between p-4 cursor-pointer transition-colors group/rev",
                                      selectedKey?.id === v.id ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    )}
                                  >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      {/* Selection Checkbox/Indicator */}
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCompareSelection(v.id);
                                        }}
                                        className={cn(
                                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                                          selectedCompareIds.includes(v.id)
                                            ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                            : "border-slate-200 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-800"
                                        )}
                                      >
                                        {selectedCompareIds.includes(v.id) && (
                                          <div className="text-[10px] font-black">{selectedCompareIds.indexOf(v.id) + 1}</div>
                                        )}
                                      </div>

                                      <Clock className={cn("w-4 h-4 shrink-0", selectedKey?.id === v.id ? "text-indigo-500" : "text-slate-300")} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className={cn("text-[10px] font-black", selectedKey?.id === v.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400")}>
                                            REV.{v.revNo}
                                          </span>
                                          <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(v.updateDate).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 truncate italic mt-0.5">{v.filename}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {versions.findIndex(prev => prev.id === v.id) < versions.length - 1 && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const idx = versions.findIndex(prev => prev.id === v.id);
                                            const prevV = versions[idx + 1];
                                            setCompareTarget({
                                              baseId: prevV.id,
                                              targetId: v.id,
                                              baseTitle: `REV.${prevV.revNo}`,
                                              targetTitle: `REV.${v.revNo}`
                                            });
                                          }}
                                          title="Compare with previous version"
                                          className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm transition-all active:scale-90"
                                        >
                                          <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button 
                                        onClick={(e) => handleDownload(e, v)}
                                        disabled={isDownloading(v.id)}
                                        className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 shadow-sm transition-all active:scale-90"
                                      >
                                        {isDownloading(v.id) ? <Zap className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-40 transition-opacity">
              <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-5 transition-colors" />
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">
                {selectedProductId ? "No key tables matching your search" : "Select a node to query key data"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {compareTarget && (
        <PhotoKeyDiffModal
          baseId={compareTarget.baseId}
          targetId={compareTarget.targetId}
          baseTitle={compareTarget.baseTitle}
          targetTitle={compareTarget.targetTitle}
          onClose={() => setCompareTarget(null)}
        />
      )}
    </main>
  );
};
