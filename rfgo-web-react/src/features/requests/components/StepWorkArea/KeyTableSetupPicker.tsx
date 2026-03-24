import React from 'react';
import { Save, Loader2, Settings2 } from 'lucide-react';
import { useKeyTableSetupSelection } from '../../hooks/useKeyTableSetupSelection';
import { useKeyTableSetupStore } from '../../store/useKeyTableSetupStore';

// Components
import { KeyTableSetupBucketSelector } from './KeyTableSetupPicker/KeyTableSetupBucketSelector';
import { PhotoKeyPreviewModal } from './KeyTableSetupPicker/PhotoKeyPreviewModal';

interface KeyTableSetupPickerProps {
  request: any;
  onSave: () => void;
  disabled?: boolean;
}

export const KeyTableSetupPicker: React.FC<KeyTableSetupPickerProps> = ({ request, onSave, disabled }) => {
  const { 
    loadingSaved, 
    saving, 
    handleSave 
  } = useKeyTableSetupSelection(request, onSave);

  const { previewTable, setPreviewTable } = useKeyTableSetupStore();

  if (loadingSaved) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950/40 shadow-sm relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <header className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Settings2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Key Table Setup</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage photo-key tables for setup configuration</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {/* Bucket Selector Area */}
        <KeyTableSetupBucketSelector />
      </div>

      {!disabled && (
        <footer className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-md text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all active:scale-[0.98] group"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
            {saving ? "Saving..." : "Apply Selection"}
          </button>
        </footer>
      )}

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
