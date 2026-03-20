import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  GET_PHOTO_KEYS_FOR_REQUEST, 
  SAVE_REQUEST_TABLES, 
  GET_REQUEST_TABLES,
  GET_STREAM_INFOS_BY_PRODUCT
} from '../../api/requestQueries';
import { 
  GetRequestTablesQuery, 
  GetRequestTablesQueryVariables, 
  GetPhotoKeysForRequestQuery, 
  GetPhotoKeysForRequestQueryVariables, 
  GetStreamInfosByProductQuery, 
  GetStreamInfosByProductQueryVariables, 
  SaveRequestTablesMutation, 
  SaveRequestTablesMutationVariables 
} from '@/shared/api/generated/graphql';
import { RequestType } from '../../types';
import { type PhotoKey } from '@/features/master-data/types';
import { KeyListSection } from './shared/KeyListSection';

interface ReferenceTablePickerProps {
  request: any;
  onSave: () => void;
}

export const ReferenceTablePicker: React.FC<ReferenceTablePickerProps> = ({ request, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedStreamRequestId, setSelectedStreamRequestId] = useState<number | null>(null);

  const { data: savedData, refetch: refetchSaved } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(GET_REQUEST_TABLES, {
    variables: { requestId: request.id, type: 'REFERENCE' }
  });

  useEffect(() => {
    if (savedData?.requestTables) {
      setSelectedIds(savedData.requestTables.map((m: any) => m.photoKeyId));
    }
  }, [savedData]);

  const { data: streamInfosData } = useQuery<GetStreamInfosByProductQuery, GetStreamInfosByProductQueryVariables>(GET_STREAM_INFOS_BY_PRODUCT, {
    variables: { productId: request.productId },
    skip: request.requestType !== RequestType.NEW
  });

  const isNew = request.requestType === RequestType.NEW;

  const { data: setupKeysData } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(GET_REQUEST_TABLES, {
    variables: { requestId: selectedStreamRequestId as number, type: 'SETUP' },
    skip: !isNew || !selectedStreamRequestId
  });

  const { data: directKeysData } = useQuery<GetPhotoKeysForRequestQuery, GetPhotoKeysForRequestQueryVariables>(GET_PHOTO_KEYS_FOR_REQUEST, {
    variables: { productId: request.productId },
    skip: isNew
  });

  const availableKeys: PhotoKey[] = isNew 
    ? (setupKeysData?.requestTables?.map((m: any) => m.photoKey) || [])
    : (directKeysData?.photoKeys || []);

  const [saveTables] = useMutation<SaveRequestTablesMutation, SaveRequestTablesMutationVariables>(SAVE_REQUEST_TABLES);

  const handleToggle = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleFinalSave = async () => {
    await saveTables({
      variables: {
        input: {
          requestId: request.id,
          productId: request.productId,
          processPlanId: availableKeys[0]?.processPlanId || 0,
          beolOptionId: availableKeys[0]?.beolOptionId || 0,
          photoKeyIds: selectedIds,
          type: 'REFERENCE'
        }
      }
    });
    toast.success("Reference tables saved");
    onSave();
    refetchSaved();
  };

  const splitByRfg = (keys: PhotoKey[]) => {
    const common = keys.filter(k => k.rfgCategory === 'common');
    const option = keys.filter(k => k.rfgCategory !== 'common');
    return { common, option };
  };

  const { common, option } = splitByRfg(availableKeys);

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-slate-950/20">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-4 h-4 text-indigo-500" />
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Reference Table Selection</h4>
      </div>

      {isNew && (
        <div className="space-y-3">
          <label className="text-[8px] font-black uppercase text-slate-500">Source StreamInfo</label>
          <select 
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold"
            onChange={(e) => setSelectedStreamRequestId(Number(e.target.value))}
            value={selectedStreamRequestId || ''}
          >
            <option value="">Select Stream Path Source</option>
            {streamInfosData?.streamInfosByProduct?.map((si: any) => (
              <option key={si.id} value={si.requestId}>{si.streamPath} (REQ-{si.requestId}: {si.request.title})</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <KeyListSection title="Common Keys" keys={common} selectedIds={selectedIds} onToggle={handleToggle} />
        <KeyListSection title="Option Keys" keys={option} selectedIds={selectedIds} onToggle={handleToggle} />
      </div>

      <button 
        onClick={handleFinalSave}
        className="w-full py-3 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
      >
        Save Table Selection
      </button>
    </div>
  );
};
