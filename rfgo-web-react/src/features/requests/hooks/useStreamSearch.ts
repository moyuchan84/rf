import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_PROCESS_PLANS } from '@/features/master-data/api/masterDataQueries';
import { GET_STREAM_INFOS_BY_BEOL_OPTION, SEARCH_PHOTO_KEYS_BY_STREAM } from '../api/requestQueries';
import { ProcessPlan, PhotoKey } from '@/features/master-data/types';
import { useReferenceTableStore } from '../store/useReferenceTableStore';

interface ProcessPlansData {
  processPlans: ProcessPlan[];
}

interface StreamInfoItem {
  id: number;
  streamInputOutputFile: string;
  productId: number;
  product: {
    id: number;
    partId: string;
    productName: string;
  };
}

interface StreamInfosData {
  streamInfosByBeolOption: StreamInfoItem[];
}

export const useStreamSearch = () => {
  const { 
    processPlanId, 
    beolOptionId,     
    setProcessContext,
    setAvailableKeys 
  } = useReferenceTableStore();

  const [selectedStreamFile, setSelectedStreamFile] = useState<string>('');

  // 1. Fetch Hierarchy
  const { data: hierarchyData, loading: loadingHierarchy } = useQuery<ProcessPlansData>(GET_PROCESS_PLANS);

  // 2. Fetch StreamInfos when BeolOption is selected
  const [fetchStreams, { data: streamsData, loading: loadingStreams }] = useLazyQuery<StreamInfosData, { beolOptionId: number }>(
    GET_STREAM_INFOS_BY_BEOL_OPTION
  );

  // 3. Search Keys by Stream File
  const [searchKeys, { loading: loadingKeys, data: keysData, error }] = useLazyQuery<{ searchPhotoKeysByStream: PhotoKey[] }, { query: string }>(
    SEARCH_PHOTO_KEYS_BY_STREAM,
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (beolOptionId) {
      fetchStreams({ variables: { beolOptionId } });
      setSelectedStreamFile('');
    }
  }, [beolOptionId, fetchStreams]);

  useEffect(() => {
    if (selectedStreamFile) {
      searchKeys({ variables: { query: selectedStreamFile } });
    } else {
      setAvailableKeys([]);
    }
  }, [selectedStreamFile, searchKeys, setAvailableKeys]);

  useEffect(() => {
    if (keysData?.searchPhotoKeysByStream) {
      setAvailableKeys(keysData.searchPhotoKeysByStream);
    }
  }, [keysData, setAvailableKeys]);

  const hierarchy = hierarchyData?.processPlans || [];
  const selectedPlan = hierarchy.find(p => p.id === processPlanId);
  const selectedOption = selectedPlan?.beolOptions?.find(o => o.id === beolOptionId);
  
  // Unique stream files for the dropdown
  const streamFiles = streamsData?.streamInfosByBeolOption || [];

  return {
    hierarchy,
    loadingHierarchy,
    loadingStreams,
    loadingKeys,
    error,
    processPlanId,
    beolOptionId,
    selectedStreamFile,
    setSelectedStreamFile,
    setProcessContext,
    selectedPlan,
    selectedOption,
    streamFiles
  };
};
