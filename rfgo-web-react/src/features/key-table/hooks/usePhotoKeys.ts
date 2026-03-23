import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PHOTO_KEYS } from '../api/keyTableQueries';
import { type PhotoKey } from '../../master-data/types';
import { useKeyTableStore } from '../store/useKeyTableStore';

export const usePhotoKeys = () => {
  const { selectedPlanId, selectedOptionId, selectedProductId, setPhotoKeys } = useKeyTableStore();

  const { data, loading, error, refetch } = useQuery<{ photoKeys: PhotoKey[] }>(
    GET_PHOTO_KEYS,
    {
      variables: {
        productId: selectedProductId,
        beolOptionId: selectedOptionId,
        processPlanId: selectedPlanId,
      },
      skip: !selectedProductId,
    }
  );

  useEffect(() => {
    if (data?.photoKeys) {
      setPhotoKeys(data.photoKeys);
    }
  }, [data, setPhotoKeys]);

  return {
    photoKeys: data?.photoKeys || [],
    loading,
    error,
    refetch,
  };
};
