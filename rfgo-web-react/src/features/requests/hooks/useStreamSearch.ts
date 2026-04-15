import { useState, useEffect, useMemo } from 'react';
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
    beolOptionId: beolGroupId, // Repurpose as beolGroupId
    setProcessContext,
    setAvailableKeys 
  } = useReferenceTableStore();

  const [selectedStreamFile, setSelectedStreamFile] = useState<string>('');

  // 1. Fetch Hierarchy
  const { data: hierarchyData, loading: loadingHierarchy } = useQuery<ProcessPlansData>(GET_PROCESS_PLANS);

  // 2. Fetch StreamInfos when BeolGroup is selected
  // We'll fetch for the group. Since the API expects beolOptionId, 
  // we'll need a group-based API or handle it via individual options.
  // For now, let's assume we can pass beolOptionId=beolGroupId and backend handles it.
  const [fetchStreams, { data: streamsData, loading: loadingStreams }] = useLazyQuery<StreamInfosData, { beolOptionId: number }>(
    GET_STREAM_INFOS_BY_BEOL_OPTION
  );

  // 3. Search Keys by Stream File
  const [searchKeys, { loading: loadingKeys, data: keysData, error }] = useLazyQuery<{ searchPhotoKeysByStream: PhotoKey[] }, { query: string }>(
    SEARCH_PHOTO_KEYS_BY_STREAM,
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (beolGroupId) {
      fetchStreams({ variables: { beolOptionId: beolGroupId } });
      setSelectedStreamFile('');
    }
  }, [beolGroupId, fetchStreams]);

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
  
  // Extract unique BeolGroups
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
  
  // Unique stream files for the dropdown
  const streamFiles = streamsData?.streamInfosByBeolOption || [];

  return {
    hierarchy,
    loadingHierarchy,
    loadingStreams,
    loadingKeys,
    error,
    processPlanId,
    beolGroupId,
    selectedStreamFile,
    setSelectedStreamFile,
    setProcessContext,
    selectedPlan,
    availableGroups,
    selectedGroup,
    streamFiles
  };
};
