import React, { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { ChevronRight, Database, Loader2, Search, Filter } from 'lucide-react';
import { GET_PROCESS_PLANS } from '@/features/master-data/api/masterDataQueries';
import { GET_PHOTO_KEYS_FOR_REQUEST } from '../../../api/requestQueries';
import { useReferenceTableStore } from '../../../store/useReferenceTableStore';
import { PhotoKey, ProcessPlan } from '@/features/master-data/types';

interface ProcessSearchPanelProps {
  onResultsFound: (keys: PhotoKey[]) => void;
  onClear: () => void;
}

interface ProcessPlansData {
  processPlans: ProcessPlan[];
}

interface PhotoKeysData {
  photoKeys: PhotoKey[];
}

interface PhotoKeysVars {
  productId?: number | null;
  beolOptionId?: number | null;
  processPlanId?: number | null;
}

export const ProcessSearchPanel: React.FC<ProcessSearchPanelProps> = ({ onResultsFound, onClear }) => {
  const { processPlanId, beolOptionId, productId, setProcessContext } = useReferenceTableStore();

  const { data: hierarchy, loading: hierarchyLoading } = useQuery<ProcessPlansData>(GET_PROCESS_PLANS);
  const [fetchKeys, { data: keysData, loading: keysLoading }] = useLazyQuery<PhotoKeysData, PhotoKeysVars>(GET_PHOTO_KEYS_FOR_REQUEST);

  useEffect(() => {
    if (keysData?.photoKeys) {
      onResultsFound(keysData.photoKeys);
    }
  }, [keysData, onResultsFound]);

  const selectedPlan = hierarchy?.processPlans?.find((p) => p.id === processPlanId);
  const selectedOption = selectedPlan?.beolOptions?.find((o) => o.id === beolOptionId);
  const selectedProduct = selectedOption?.products?.find((p) => p.id === productId);

  useEffect(() => {
    if (productId || beolOptionId) {
      fetchKeys({
        variables: {
          processPlanId,
          beolOptionId,
          productId
        }
      });
    } else {
      onClear();
    }
  }, [processPlanId, beolOptionId, productId, fetchKeys, onClear]);

  if (hierarchyLoading) return <div className="flex items-center gap-2 p-6 justify-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-[9px] font-black uppercase tracking-widest">Loading Hierarchy...</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Process Hierarchy Filtering</h4>
          <p className="text-[8px] font-bold text-slate-400 uppercase">Select ProcessPlan -&gt; Option -&gt; Product</p>
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
            {hierarchy?.processPlans?.map((p) => (
              <option key={p.id} value={p.id}>{p.designRule}</option>
            ))}
          </select>
        </div>

        {/* BEOL Option Select */}
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">BEOL Option</label>
          <select
            disabled={!processPlanId}
            value={beolOptionId || ''}
            onChange={(e) => setProcessContext(processPlanId, Number(e.target.value), null)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all shadow-sm"
          >
            <option value="">Select Option...</option>
            {selectedPlan?.beolOptions?.map((o) => (
              <option key={o.id} value={o.id}>{o.optionName}</option>
            ))}
          </select>
        </div>

        {/* Product Select */}
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Product</label>
          <select
            disabled={!beolOptionId}
            value={productId || ''}
            onChange={(e) => setProcessContext(processPlanId, beolOptionId, Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 transition-all shadow-sm"
          >
            <option value="">Select Product...</option>
            {selectedOption?.products?.map((p) => (
              <option key={p.id} value={p.id}>{p.productName} ({p.partId})</option>
            ))}
          </select>
        </div>
      </div>

      {(keysLoading) && (
        <div className="flex items-center gap-2 justify-center py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span className="text-[8px] font-black uppercase text-slate-400">Filtering Tables...</span>
        </div>
      )}
    </div>
  );
};
