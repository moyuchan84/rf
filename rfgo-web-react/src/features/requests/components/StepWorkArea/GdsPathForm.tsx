import React from 'react';
import { Database, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { useGdsPathSelection } from '../../hooks/useGdsPathSelection';
import { useGdsPathStore } from '../../store/useGdsPathStore';

interface GdsPathFormProps {
  request: any;
  onSave: () => void;
  disabled?: boolean;
}

export const GdsPathForm: React.FC<GdsPathFormProps> = ({ request, onSave, disabled }) => {
  const { 
    loadingSaved, 
    saving, 
    handleSave 
  } = useGdsPathSelection(request, onSave);

  const { gdsPathList, addGdsPath, removeGdsPath, updateGdsPath } = useGdsPathStore();

  if (loadingSaved) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950/40 shadow-sm relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">GDS Path Configuration</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define GDS paths for this request</p>
          </div>
        </div>
        
        {!disabled && (
          <button 
            onClick={() => addGdsPath('')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all border border-indigo-100 dark:border-indigo-800"
          >
            <Plus className="w-3 h-3" /> Add Path
          </button>
        )}
      </header>

      <div className="space-y-3 relative z-10">
        {gdsPathList.map((path, index) => (
          <div key={index} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex-1 relative">
              <input 
                value={path}
                onChange={(e) => updateGdsPath(index, e.target.value)}
                readOnly={disabled}
                className={`w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${disabled ? 'cursor-default opacity-80' : ''}`}
                placeholder="/data/gds/path/..."
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest pointer-events-none">
                PATH #{index + 1}
              </span>
            </div>
            
            {!disabled && gdsPathList.length > 1 && (
              <button 
                onClick={() => removeGdsPath(index)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                title="Remove Path"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!disabled && (
        <footer className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-md text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all active:scale-[0.98] group"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
            {saving ? "Saving..." : "Apply GDS Paths"}
          </button>
        </footer>
      )}
    </div>
  );
};
