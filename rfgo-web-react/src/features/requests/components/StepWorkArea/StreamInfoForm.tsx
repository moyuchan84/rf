import React from 'react';
import { PlayCircle, Loader2, Save } from 'lucide-react';
import { useStreamInfoSelection } from '../../hooks/useStreamInfoSelection';
import { useStreamInfoStore } from '../../store/useStreamInfoStore';

interface StreamInfoFormProps {
  request: any;
  onSave: () => void;
  disabled?: boolean;
}

export const StreamInfoForm: React.FC<StreamInfoFormProps> = ({ request, onSave, disabled }) => {
  const { 
    loadingSaved, 
    saving, 
    handleSave 
  } = useStreamInfoSelection(request, onSave);

  const { streamPath, streamInputOutputFile, setStreamPath, setStreamInputOutputFile } = useStreamInfoStore();

  if (loadingSaved) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950/40 shadow-sm relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Stream Information</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage stream path and I/O files</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 relative z-10">
        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Stream Path</label>
          <input 
            value={streamPath}
            onChange={(e) => setStreamPath(e.target.value)}
            readOnly={disabled}
            className={`w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${disabled ? 'cursor-default opacity-80' : ''}`}
            placeholder="/data/stream/path/..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">Stream Input/Output File Content</label>
          <textarea 
            value={streamInputOutputFile}
            onChange={(e) => setStreamInputOutputFile(e.target.value)}
            readOnly={disabled}
            rows={6}
            className={`w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none custom-scrollbar ${disabled ? 'cursor-default opacity-80' : ''}`}
            placeholder="Paste your stream input/output file content here..."
          />
        </div>
      </div>

      {!disabled && (
        <footer className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-md text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all active:scale-[0.98] group"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
            {saving ? "Saving..." : "Apply Stream Info"}
          </button>
        </footer>
      )}
    </div>
  );
};
