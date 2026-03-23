import React from 'react';
import { Database, Save, Loader2 } from 'lucide-react';
import { useReferenceTableSelection } from '../../hooks/useReferenceTableSelection';
import { useReferenceTableStore } from '../../store/useReferenceTableStore';

// Components
import { ScenarioSelector } from './ReferenceTablePicker/ScenarioSelector';
import { StreamSearchPanel } from './ReferenceTablePicker/StreamSearchPanel';
import { ProcessSearchPanel } from './ReferenceTablePicker/ProcessSearchPanel';
import { TableBucketSelector } from './ReferenceTablePicker/TableBucketSelector';
import { PhotoKeyPreviewModal } from './ReferenceTablePicker/PhotoKeyPreviewModal';

interface ReferenceTablePickerProps {
  request: any;
  onSave: () => void;
}

export const ReferenceTablePicker: React.FC<ReferenceTablePickerProps> = ({ request, onSave }) => {
  const { 
    scenario, 
    loadingSaved, 
    saving, 
    handleSave 
  } = useReferenceTableSelection(request, onSave);

  const { previewTable, setPreviewTable } = useReferenceTableStore();

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
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Reference Configuration</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select and manage reference photo-key tables</p>
          </div>
        </div>
        
        <ScenarioSelector />
      </header>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {/* Search/Selection Area */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-md shadow-inner">
          {scenario === 'STREAM' ? (
            <StreamSearchPanel />
          ) : (
            <ProcessSearchPanel />
          )}
        </div>

        {/* Bucket Selector Area */}
        <TableBucketSelector />
      </div>

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
          {saving ? "Saving..." : "Apply Selection"}
        </button>
      </footer>

      {/* Preview Modal */}
      {previewTable && (
        <PhotoKeyPreviewModal 
          table={previewTable} 
          onClose={() => setPreviewTable(null)} 
        />
      )}
    </div>
  );
};
