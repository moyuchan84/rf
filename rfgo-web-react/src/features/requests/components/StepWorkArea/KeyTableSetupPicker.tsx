import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  GET_PHOTO_KEYS, 
  SAVE_REQUEST_TABLES, 
  GET_REQUEST_TABLES
} from '../../api/requestQueries';
import { 
  type GetRequestTablesQuery, 
  type GetRequestTablesQueryVariables, 
  type GetPhotoKeysQuery, 
  type GetPhotoKeysQueryVariables, 
  type SaveRequestTablesMutation, 
  type SaveRequestTablesMutationVariables 
} from '@/shared/api/generated/graphql';
import { type PhotoKey } from '@/features/master-data/types';
import { KeyListSection } from './shared/KeyListSection';

interface KeyTableSetupPickerProps {
  request: any;
  onSave: () => void;
}

export const KeyTableSetupPicker: React.FC<KeyTableSetupPickerProps> = ({ request, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: savedData, refetch: refetchSaved } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(GET_REQUEST_TABLES, {
    variables: { requestId: request.id, type: 'SETUP' }
  });

  useEffect(() => {
    if (savedData?.requestTables) {
      setSelectedIds(savedData.requestTables.map((m: any) => m.photoKeyId));
    }
  }, [savedData]);

  const { data: keysData } = useQuery<GetPhotoKeysQuery, GetPhotoKeysQueryVariables>(GET_PHOTO_KEYS, {
    variables: { productId: request.productId }
  });

  const [saveTables] = useMutation<SaveRequestTablesMutation, SaveRequestTablesMutationVariables>(SAVE_REQUEST_TABLES);

  const availableKeys: PhotoKey[] = keysData?.photoKeys || [];

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
          type: 'SETUP'
        }
      }
    });
    toast.success("Setup tables saved");
    onSave();
    refetchSaved();
  };

  const splitByPhoto = (keys: PhotoKey[]) => {
    const info = keys.filter(k => k.photoCategory === 'info');
    const key = keys.filter(k => k.photoCategory === 'key');
    return { info, key };
  };

  const { info, key: keysOnly } = splitByPhoto(availableKeys);

  return (
    <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-slate-950/20">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="w-4 h-4 text-emerald-500" />
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Final KeyTable Setup</h4>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <KeyListSection title="Info Tables" keys={info} selectedIds={selectedIds} onToggle={handleToggle} />
        <KeyListSection title="Key Tables" keys={keysOnly} selectedIds={selectedIds} onToggle={handleToggle} />
      </div>

      <button 
        onClick={handleFinalSave}
        className="w-full py-3 bg-emerald-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98]"
      >
        Save Setup Selection
      </button>
    </div>
  );
};
