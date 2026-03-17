import React from 'react';
import { PlusCircle, X } from 'lucide-react';

interface ArrayInputProps {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  newVal: string;
  setNewVal: (v: string) => void;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({ 
  label, 
  items, 
  setItems, 
  newVal, 
  setNewVal 
}) => (
  <div className="space-y-3">
    <label className="text-[8px] font-black uppercase text-slate-500 ml-1">{label}</label>
    <div className="flex gap-2">
      <input 
        value={newVal}
        onChange={(e) => setNewVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (newVal) { setItems([...items, newVal]); setNewVal(''); }
          }
        }}
        className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-bold"
        placeholder="Add item..."
      />
      <button 
        onClick={() => { if (newVal) { setItems([...items, newVal]); setNewVal(''); } }}
        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-indigo-600 hover:text-white transition-all"
      >
        <PlusCircle className="w-4 h-4" />
      </button>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, idx) => (
        <span key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[8px] font-bold text-slate-600 dark:text-slate-300">
          {it}
          <button onClick={() => setItems(items.filter(i => i !== it))} className="text-slate-400 hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
        </span>
      ))}
    </div>
  </div>
);
