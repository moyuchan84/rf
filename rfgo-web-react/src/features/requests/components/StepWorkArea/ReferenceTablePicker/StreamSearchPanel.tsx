import React from 'react';
import { Loader2, Database} from 'lucide-react';
import { useStreamSearch } from '../../../hooks/useStreamSearch';

export const StreamSearchPanel: React.FC = () => {
  const {
    hierarchy,
    loadingHierarchy,
    loadingStreams,
    loadingKeys,
    processPlanId,
    beolGroupId,
    selectedStreamFile,
    setSelectedStreamFile,
    setProcessContext,
    availableGroups,    
    streamFiles
  } = useStreamSearch();

  if (loadingHierarchy) {
    return (
      <div className="flex items-center gap-2 p-6 justify-center text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /> 
        <span className="text-[9px] font-black uppercase tracking-widest">Loading Hierarchy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Search by Stream File</h4>
          <p className="text-[8px] font-bold text-slate-400 uppercase">Select Plan -&gt; Group -&gt; Stream File</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Process Plan Select */}
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Process Plan</label>
          <select
            value={processPlanId || ''}
            onChange={(e) => setProcessContext(Number(e.target.value), null, null)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm"
          >
            <option value="">Select Plan...</option>
            {hierarchy.map((p) => (
              <option key={p.id} value={p.id}>{p.designRule}</option>
            ))}
          </select>
        </div>

        {/* BEOL Group Select */}
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">BEOL Group</label>
          <select
            disabled={!processPlanId}
            value={beolGroupId || ''}
            onChange={(e) => setProcessContext(processPlanId, Number(e.target.value), null)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all shadow-sm"
          >
            <option value="">Select Group...</option>
            {availableGroups?.map((g) => (
              <option key={g.id} value={g.id}>{g.groupName}</option>
            ))}
          </select>
        </div>

        {/* Stream File Select */}
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Stream File</label>
          <div className="relative">
            <select
              disabled={!beolGroupId || loadingStreams}
              value={selectedStreamFile}
              onChange={(e) => setSelectedStreamFile(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all shadow-sm"
            >
              <option value="">Select Stream File...</option>
              {streamFiles.map((sf) => (
                <option key={sf.id} value={sf.streamInputOutputFile}>
                  {sf.streamInputOutputFile} ({sf.product.partId})
                </option>
              ))}
            </select>
            {loadingStreams && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {(loadingKeys) && (
        <div className="flex items-center gap-2 justify-center py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span className="text-[8px] font-black uppercase text-slate-400">Fetching Setup Tables...</span>
        </div>
      )}
    </div>
  );
};
