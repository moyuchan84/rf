import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Database, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  GET_REQUEST_TABLES,
  SAVE_REQUEST_TABLES,
  GET_PHOTO_KEYS_FOR_REQUEST
} from '../../api/requestQueries';
import { 
  GetRequestTablesQuery, 
  GetRequestTablesQueryVariables, 
  SaveRequestTablesMutation, 
  SaveRequestTablesMutationVariables,
  GetPhotoKeysForRequestQuery,
  GetPhotoKeysForRequestQueryVariables
} from '@/shared/api/generated/graphql';
import { RequestType } from '../../types';
import { PhotoKey } from '@/features/master-data/types';
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
    setScenario, 
    selectedTables, 
    setSelectedTables,
    previewTable,
    setPreviewTable,
    reset
  } = useReferenceTableStore();

  const [availableKeys, setAvailableKeys] = useState<PhotoKey[]>([]);

  // 0. Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 1. Load saved tables
  const { data: savedData, loading: savedLoading } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(
    GET_REQUEST_TABLES, 
    {
      variables: { requestId: request.id, type: 'REFERENCE' },
      fetchPolicy: 'network-only'
    }
  );

  // 2. Fetch all details for saved tables
  useEffect(() => {
    if (savedData?.requestTables) {
      const keys = savedData.requestTables
        .map((rt: any) => rt.photoKey)
        .filter(Boolean) as PhotoKey[];
      
      // Only set if we don't have a selection already or if we just loaded
      setSelectedTables(keys);
    }
  }, [savedData, setSelectedTables]);

  // Initial scenario based on request type
  useEffect(() => {
    if (request.requestType === RequestType.NEW) {
      setScenario('STREAM');
    } else {
      setScenario('PROCESS');
    }
  }, [request.requestType, setScenario]);

  // 3. Save mutation
  const [saveTables, { loading: saving }] = useMutation<SaveRequestTablesMutation, SaveRequestTablesMutationVariables>(SAVE_REQUEST_TABLES);

  const handleFinalSave = async () => {
    if (selectedTables.length === 0) {
      toast.error("Please select at least one reference table");
      return;
    }

    try {
      await saveTables({
        variables: {
          input: {
            requestId: request.id,
            productId: request.productId,
            processPlanId: selectedTables[0]?.processPlanId || 0,
            beolOptionId: selectedTables[0]?.beolOptionId || 0,
            photoKeyIds: selectedTables.map(t => t.id),
            type: 'REFERENCE'
          }
        }
      });
      toast.success("Reference tables updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to save reference tables");
    }
  };

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
            <StreamSearchPanel 
              productId={request.productId} 
              onResultsFound={setAvailableKeys} 
              onClear={() => setAvailableKeys([])}
            />
          ) : (
            <ProcessSearchPanel 
              onResultsFound={setAvailableKeys}
              onClear={() => setAvailableKeys([])}
            />
          )}
        </div>

        {/* Bucket Selector Area */}
        <TableBucketSelector availableKeys={availableKeys} />
      </div>

      <footer className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
        <button 
          onClick={handleFinalSave}
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
