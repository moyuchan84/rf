import React, { useMemo, useState } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronDown,
  ShoppingBag, 
  ArrowRightLeft,
  Info,
  Database,
  Search,
  Zap,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { PhotoKey } from '@/features/master-data/types';
import { useReferenceTableStore } from '../../../store/useReferenceTableStore';

// Helper for date formatting: yy.MM.dd HH:mm
const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  const yy = date.getFullYear().toString().slice(-2);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  
  return `${yy}.${mm}.${dd} ${hh}:${min}`;
};

interface TableBucketSelectorProps {
  availableKeys: PhotoKey[];
}

export const TableBucketSelector: React.FC<TableBucketSelectorProps> = ({ availableKeys }) => {
  const { 
    selectedTables, 
    addTable, 
    removeTable, 
    setSelectedTables,
    setPreviewTable 
  } = useReferenceTableStore();

  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  // Group available keys by category -> tableName
  const nestedAvailable = useMemo(() => {
    const groups: Record<string, Record<string, PhotoKey[]>> = {};
    availableKeys.forEach(key => {
      const cat = key.rfgCategory || 'UNCLASSIFIED';
      const name = key.tableName || 'UNKNOWN';
      if (!groups[cat]) groups[cat] = {};
      if (!groups[cat][name]) groups[cat][name] = [];
      groups[cat][name].push(key);
    });

    // Sort revNo descending
    Object.keys(groups).forEach(cat => {
      Object.keys(groups[cat]).forEach(name => {
        groups[cat][name].sort((a, b) => b.revNo - a.revNo);
      });
    });
    return groups;
  }, [availableKeys]);

  // Group selected keys by category for better readability on the right
  const groupedSelected = useMemo(() => {
    const groups: Record<string, PhotoKey[]> = {};
    selectedTables.forEach(key => {
      const cat = key.rfgCategory || 'UNCLASSIFIED';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(key);
    });
    return groups;
  }, [selectedTables]);

  const toggleExpand = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleSelectLatest = (targetKeys: PhotoKey[]) => {
    // For each table name, pick the one with highest revNo
    const latestMap: Record<string, PhotoKey> = {};
    targetKeys.forEach(key => {
      if (!latestMap[key.tableName] || key.revNo > latestMap[key.tableName].revNo) {
        latestMap[key.tableName] = key;
      }
    });

    const latestList = Object.values(latestMap);
    
    // Add to existing selected (avoid duplicates)
    const newSelected = [...selectedTables];
    latestList.forEach(latest => {
      if (!newSelected.some(t => t.id === latest.id)) {
        newSelected.push(latest);
      }
    });
    setSelectedTables(newSelected);
  };

  const PhotoKeyItem = ({ keyData, isSelected, onAction, showDetails = true }: { 
    keyData: PhotoKey, 
    isSelected: boolean, 
    onAction: () => void,
    showDetails?: boolean
  }) => (
    <div className={`group flex items-center justify-between p-2 rounded-md transition-all ${
      isSelected 
        ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          keyData.photoCategory === 'ALIGN' ? 'bg-amber-400' : 'bg-sky-400'
        }`} title={keyData.photoCategory || ''} />
        
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">REV.{keyData.revNo}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              {formatDate(keyData.updateDate)}
            </span>
          </div>
          {showDetails && (
            <p className="text-[8px] font-bold text-slate-400 truncate max-w-[180px] italic">{keyData.filename}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setPreviewTable(keyData)}
          className="p-1 text-slate-400 hover:text-indigo-500 rounded transition-colors"
          title="Preview Data"
        >
          <Eye className="w-3 h-3" />
        </button>
        <button 
          onClick={onAction}
          className={`p-1 rounded transition-all ${
            isSelected 
              ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
          }`}
          title={isSelected ? "Remove from selection" : "Add to selection"}
        >
          {isSelected ? <Trash2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-8 h-[600px]">
      {/* LEFT: Available Results */}
      <div className="flex flex-col gap-4 border-r border-slate-100 dark:border-slate-800 pr-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Available Tables</h4>
          </div>
          
          <div className="flex items-center gap-3">
            {availableKeys.length > 0 && (
              <button 
                onClick={() => handleSelectLatest(availableKeys)}
                className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded transition-all"
              >
                <Zap className="w-3 h-3 fill-current" />
                ALL LATEST
              </button>
            )}
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {availableKeys.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {availableKeys.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
              <Search className="w-8 h-8 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest italic opacity-40">No searchable data</p>
            </div>
          ) : (
            Object.entries(nestedAvailable).map(([category, tables]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 py-1 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                    <h6 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{category}</h6>
                  </div>
                  <button 
                    onClick={() => handleSelectLatest(Object.values(tables).flat())}
                    className="text-[8px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-tighter"
                  >
                    LATEST IN {category}
                  </button>
                </div>

                <div className="space-y-2 pl-2">
                  {Object.entries(tables).map(([tableName, keys]) => {
                    const isExpanded = expandedTables[tableName];
                    const selectedCount = keys.filter(k => selectedTables.some(st => st.id === k.id)).length;
                    
                    return (
                      <div key={tableName} className="border border-slate-50 dark:border-slate-800/50 rounded-md overflow-hidden bg-slate-50/30 dark:bg-slate-900/20">
                        <button 
                          onClick={() => toggleExpand(tableName)}
                          className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{tableName}</span>
                            {selectedCount > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                            )}
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            {keys.length} REV{keys.length > 1 ? 'S' : ''}
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-2 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-black/20 divide-y divide-slate-50 dark:divide-slate-800/50">
                            {keys.map(key => (
                              <PhotoKeyItem 
                                key={key.id}
                                keyData={key}
                                isSelected={selectedTables.some(st => st.id === key.id)}
                                onAction={() => addTable(key)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Selected Bucket */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Selected Bucket</h4>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setSelectedTables([])}
              className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase px-2 py-1 rounded transition-colors"
            >
              CLEAR ALL
            </button>
            <span className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full shadow-sm">
              {selectedTables.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {selectedTables.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800/50">
              <ArrowRightLeft className="w-8 h-8 text-slate-200" />
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Bucket is empty</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Select from results on the left</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedSelected).map(([category, keys]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3 h-3 text-indigo-400" />
                  <h6 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{category}</h6>
                </div>
                <div className="space-y-1 pl-1">
                  {keys.map(key => (
                    <div key={key.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase truncate pr-4">
                          {key.tableName}
                        </span>
                        <button 
                          onClick={() => removeTable(key.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                          REV.{key.revNo}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDate(key.updateDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedTables.length > 0 && (
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/50 rounded-lg flex gap-3">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-[8px] font-bold text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed uppercase tracking-tight">
              Review your selections carefully. These tables will serve as the source of truth for the next steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
