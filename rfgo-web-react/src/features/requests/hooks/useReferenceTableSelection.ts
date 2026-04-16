import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { 
  GET_REQUEST_TABLES,
  SAVE_REQUEST_TABLES
} from '../api/requestQueries';
import { 
  GetRequestTablesQuery, 
  GetRequestTablesQueryVariables, 
  SaveRequestTablesMutation, 
  SaveRequestTablesMutationVariables,
} from '@/shared/api/generated/graphql';
import { PhotoKey } from '@/features/master-data/types';
import { useReferenceTableStore } from '../store/useReferenceTableStore';
import { RequestType } from '../types';

export const useReferenceTableSelection = (request: any, onSave: () => void) => {
  const { 
    scenario,
    setScenario,
    selectedTables, 
    setSelectedTables,
    reset
  } = useReferenceTableStore();

  // 0. Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 1. Load saved tables
  const { data: savedData, loading: loadingSaved } = useQuery<GetRequestTablesQuery, GetRequestTablesQueryVariables>(
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

  const handleSave = useCallback(async () => {
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
            beolGroupId: selectedTables[0]?.beolGroupId || 0,
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
  }, [request.id, request.productId, selectedTables, saveTables, onSave]);

  return {
    scenario,
    selectedTables,
    loadingSaved,
    saving,
    handleSave
  };
};
