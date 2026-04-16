import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { 
  GET_REQUEST_TABLES,
  SAVE_REQUEST_TABLES,
  GET_PHOTO_KEYS_FOR_REQUEST
} from '../api/requestQueries';
import { 
  GetRequestTablesQuery, 
  GetRequestTablesQueryVariables, 
  SaveRequestTablesMutation, 
  SaveRequestTablesMutationVariables,
  GetPhotoKeysForRequestQuery,
  GetPhotoKeysForRequestQueryVariables
} from '@/shared/api/generated/graphql';
import { PhotoKey } from '@/features/master-data/types';
import { useKeyTableSetupStore } from '../store/useKeyTableSetupStore';

export const useKeyTableSetupSelection = (request: any, onSave: () => void) => {
  const { 
    selectedTables, 
    setSelectedTables,
    setAvailableKeys,
    reset
  } = useKeyTableSetupStore();

  // 0. Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 1. Load saved tables (SETUP category)
  const { data: savedData, loading: loadingSaved } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(
    GET_REQUEST_TABLES, 
    {
      variables: { requestId: request.id, type: 'SETUP' },
      fetchPolicy: 'network-only'
    }
  );

  // 2. Load available tables for the product
  const { data: availableData, loading: loadingAvailable } = useQuery<GetPhotoKeysForRequestQuery, GetPhotoKeysForRequestQueryVariables>(
    GET_PHOTO_KEYS_FOR_REQUEST,
    {
      variables: { productId: request.productId },
      skip: !request.productId,
      fetchPolicy: 'network-only'
    }
  );

  // Sync saved tables to store
  useEffect(() => {
    if (savedData?.requestTables) {
      const keys = savedData.requestTables
        .map((rt: any) => rt.photoKey)
        .filter(Boolean) as PhotoKey[];
      
      setSelectedTables(keys);
    }
  }, [savedData, setSelectedTables]);

  // Sync available tables to store
  useEffect(() => {
    if (availableData?.photoKeys) {
      setAvailableKeys(availableData.photoKeys as PhotoKey[]);
    }
  }, [availableData, setAvailableKeys]);

  // 3. Save mutation
  const [saveTables, { loading: saving }] = useMutation<SaveRequestTablesMutation, SaveRequestTablesMutationVariables>(SAVE_REQUEST_TABLES);

  const handleSave = useCallback(async () => {
    if (selectedTables.length === 0) {
      toast.error("Please select at least one setup table");
      return;
    }

    try {
      await saveTables({
        variables: {
          input: {
            requestId: request.id,
            productId: request.productId,
            processPlanId: selectedTables[0]?.processPlanId || 0,
            beolGroupId: selectedTables[0]?.beolGroupId || 0,
            photoKeyIds: selectedTables.map(t => t.id),
            type: 'SETUP'
          }
        }
      });
      toast.success("Setup tables updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to save setup tables");
    }
  }, [request.id, request.productId, selectedTables, saveTables, onSave]);

  return {
    selectedTables,
    loadingSaved: loadingSaved || loadingAvailable,
    saving,
    handleSave
  };
};
