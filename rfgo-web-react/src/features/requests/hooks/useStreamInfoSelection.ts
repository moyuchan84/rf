import { useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { 
  GET_STREAM_INFO_BY_REQUEST,
  CREATE_STREAM_INFO
} from '../api/requestQueries';
import { useStreamInfoStore } from '../store/useStreamInfoStore';

export const useStreamInfoSelection = (request: any, onSave: () => void) => {
  const { 
    streamPath, 
    streamInputOutputFile,
    setStreamPath,
    setStreamInputOutputFile,
    reset
  } = useStreamInfoStore();

  // 0. Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // 1. Load saved Stream info
  const { data: savedData, loading: loadingSaved } = useQuery(
    GET_STREAM_INFO_BY_REQUEST, 
    {
      variables: { requestId: request.id },
      fetchPolicy: 'network-only'
    }
  ) as { data: any, loading: boolean };

  // Sync saved data to store
  useEffect(() => {
    if (savedData?.streamInfoByRequest?.[0]) {
      const si = savedData.streamInfoByRequest[0];
      setStreamPath(si.streamPath || '');
      setStreamInputOutputFile(si.streamInputOutputFile || '');
    }
  }, [savedData, setStreamPath, setStreamInputOutputFile]);

  // 3. Save mutation
  const [saveStreamInfo, { loading: saving }] = useMutation(CREATE_STREAM_INFO);

  const handleSave = useCallback(async () => {
    if (!streamPath.trim()) {
      toast.error("Please enter a stream path");
      return;
    }

    try {
      await saveStreamInfo({
        variables: {
          input: {
            requestId: request.id,
            productId: request.productId,
            processPlanId: request.product?.beolOption?.processPlan?.id || 0,
            beolGroupId: request.product?.beolOption?.beolGroup?.id || 0,
            streamPath,
            streamInputOutputFile
          }
        }
      });
      toast.success("Stream information updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to save stream information");
    }
  }, [request.id, request.productId, request.product, streamPath, streamInputOutputFile, saveStreamInfo, onSave]);

  return {
    streamPath,
    streamInputOutputFile,
    loadingSaved,
    saving,
    handleSave
  };
};
