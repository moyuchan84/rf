import React from 'react';
import { Search } from 'lucide-react';
import { type PhotoKey } from '../../../../master-data/types';

interface KeyListSectionProps {
  title: string;
  keys: PhotoKey[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export const KeyListSection: React.FC<KeyListSectionProps> = ({ 
  title, 
  keys, 
  selectedIds, 
  onToggle 
}) => (
  <div className="space-y-2.5">
    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{title} ({keys.length})</h5>
    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {keys.map(k => (
        <div key={k.id} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:border-indigo-500/30 transition-all shadow-sm group">
          <input 
            type="checkbox" 
            checked={selectedIds.includes(k.id)} 
            onChange={() => onToggle(k.id)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{k.tableName}</p>
            <p className="text-[8px] font-medium text-slate-400">Rev v{k.revNo}</p>
          </div>
          <button 
            onClick={() => window.open(`/keys/detail/${k.id}`, '_blank')}
            className="p-1.5 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {keys.length === 0 && <p className="text-[8px] text-slate-400 italic p-4 text-center">No tables available</p>}
    </div>
  </div>
);
