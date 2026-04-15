import { useEffect, useMemo } from 'react';
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
  beolGroupId?: number | null;
  processPlanId?: number | null;
}

export const useProcessHierarchySearch = () => {
  const { 
    processPlanId, 
    beolOptionId: beolGroupId, // Repurpose beolOptionId as beolGroupId
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
    if (productId || beolGroupId || processPlanId) {
      fetchKeys({
        variables: {
          processPlanId: processPlanId || undefined,
          beolGroupId: beolGroupId || undefined,
          productId: productId || undefined
        }
      });
    } else {
      setAvailableKeys([]);
    }
  }, [processPlanId, beolGroupId, productId, fetchKeys, setAvailableKeys]);

  const selectedPlan = hierarchy?.processPlans?.find((p) => p.id === processPlanId);
  
  // Extract unique BeolGroups from flattened beolOptions
  const availableGroups = useMemo(() => {
    if (!selectedPlan) return [];
    const groupsMap: Record<number, { id: number, groupName: string }> = {};
    selectedPlan.beolOptions.forEach(bo => {
      if (bo.beolGroup) {
        groupsMap[bo.beolGroup.id] = bo.beolGroup;
      }
    });
    return Object.values(groupsMap);
  }, [selectedPlan]);

  const selectedGroup = availableGroups.find(g => g.id === beolGroupId);
  
  // Aggregate products from all options sharing the same BeolGroup
  const availableProducts = useMemo(() => {
    if (!selectedGroup || !selectedPlan) return [];
    
    return selectedPlan.beolOptions
      .filter(o => o.beolGroup?.id === selectedGroup.id)
      .flatMap(o => o.products || []);
  }, [selectedGroup, selectedPlan]);

  return {
    hierarchy: hierarchy?.processPlans || [],
    loadingHierarchy,
    loadingKeys,
    selectedPlan,
    availableGroups,
    selectedGroup,
    availableProducts,
    processPlanId,
    beolGroupId,
    productId,
    setProcessContext
  };
};
