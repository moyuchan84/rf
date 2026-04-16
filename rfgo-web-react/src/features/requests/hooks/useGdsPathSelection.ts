import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { 
  GET_GDS_PATH_INFO_BY_REQUEST,
  CREATE_GDS_PATH_INFO
} from '../api/requestQueries';
import { useGdsPathStore } from '../store/useGdsPathStore';

interface GdsPathInfo {
  id: number;
  gdsPathList: string[];
}

interface GetGdsPathInfoData {
  gdsPathInfoByRequest: GdsPathInfo[];
}

interface CreateGdsPathInfoData {
  createGdsPathInfo: GdsPathInfo;
}

export const useGdsPathSelection = (request: any, onSave: () => void) => {
  const { 
    gdsPathList, 
    setGdsPathList,
    reset
  } = useGdsPathStore();

  // 0. Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 1. Load saved GDS paths
  const { data: savedData, loading: loadingSaved } = useQuery<GetGdsPathInfoData>(
    GET_GDS_PATH_INFO_BY_REQUEST, 
    {
      variables: { requestId: request.id },
      fetchPolicy: 'network-only'
    }
  );

  // Sync saved data to store
  useEffect(() => {
    if (savedData?.gdsPathInfoByRequest?.[0]) {
      const paths = savedData.gdsPathInfoByRequest[0].gdsPathList;
      if (paths && paths.length > 0) {
        setGdsPathList(paths);
      }
    }
  }, [savedData, setGdsPathList]);

  // 3. Save mutation
  const [saveGdsPath, { loading: saving }] = useMutation<CreateGdsPathInfoData>(CREATE_GDS_PATH_INFO);

  const handleSave = useCallback(async () => {
    const filteredPaths = gdsPathList.filter(p => p.trim() !== '');
    if (filteredPaths.length === 0) {
      toast.error("Please enter at least one GDS path");
      return;
    }

    try {
      await saveGdsPath({
        variables: {
          input: {
            requestId: request.id,
            productId: request.productId,
            processPlanId: request.product?.beolOption?.processPlan?.id || 0,
            beolGroupId: request.product?.beolOption?.beolGroup?.id || 0,
            gdsPathList: filteredPaths
          }
        }
      });
      toast.success("GDS paths updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to save GDS paths");
    }
  }, [request.id, request.productId, gdsPathList, saveGdsPath, onSave]);

  return {
    gdsPathList,
    loadingSaved,
    saving,
    handleSave
  };
};
