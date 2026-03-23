import { useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_PROCESS_PLANS } from '@/features/master-data/api/masterDataQueries';
import { GET_PHOTO_KEYS_FOR_REQUEST } from '../api/requestQueries';
import { useReferenceTableStore } from '../store/useReferenceTableStore';
import { ProcessPlan, PhotoKey } from '@/features/master-data/types';

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

export const useProcessHierarchySearch = () => {
  const { 
    processPlanId, 
    beolOptionId, 
    productId, 
    setProcessContext,
    setAvailableKeys 
  } = useReferenceTableStore();

  const { data: hierarchy, loading: loadingHierarchy } = useQuery<ProcessPlansData>(GET_PROCESS_PLANS);
  
  const [fetchKeys, { data: keysData, loading: loadingKeys }] = useLazyQuery<PhotoKeysData, PhotoKeysVars>(
    GET_PHOTO_KEYS_FOR_REQUEST
  );

  useEffect(() => {
    if (keysData?.photoKeys) {
      setAvailableKeys(keysData.photoKeys);
    }
  }, [keysData, setAvailableKeys]);

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
      setAvailableKeys([]);
    }
  }, [processPlanId, beolOptionId, productId, fetchKeys, setAvailableKeys]);

  const selectedPlan = hierarchy?.processPlans?.find((p) => p.id === processPlanId);
  const selectedOption = selectedPlan?.beolOptions?.find((o) => o.id === beolOptionId);
  // selectedProduct is not strictly needed for the dropdowns but kept for symmetry
  // const selectedProduct = selectedOption?.products?.find((p) => p.id === productId);

  return {
    hierarchy: hierarchy?.processPlans || [],
    loadingHierarchy,
    loadingKeys,
    selectedPlan,
    selectedOption,
    processPlanId,
    beolOptionId,
    productId,
    setProcessContext
  };
};
