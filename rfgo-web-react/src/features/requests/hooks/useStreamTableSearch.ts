import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_STREAM_INFOS_BY_PRODUCT, GET_REQUEST_TABLES } from '../api/requestQueries';
import { 
  GetStreamInfosByProductQuery, 
  GetStreamInfosByProductQueryVariables,
  GetRequestTablesQuery,
  GetRequestTablesQueryVariables
} from '@/shared/api/generated/graphql';
import { useState, useMemo } from 'react';

export const useStreamTableSearch = (productId: number) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: streamData, loading: streamLoading } = useQuery<GetStreamInfosByProductQuery, GetStreamInfosByProductQueryVariables>(
    GET_STREAM_INFOS_BY_PRODUCT,
    { variables: { productId } }
  );

  const filteredStreams = useMemo(() => {
    if (!streamData?.streamInfosByProduct || !searchQuery) return streamData?.streamInfosByProduct || [];
    const q = searchQuery.toLowerCase();
    return streamData.streamInfosByProduct.filter(s => 
      s.streamPath?.toLowerCase().includes(q) || 
      s.requestId?.toString().includes(q)
    );
  }, [streamData, searchQuery]);

  return {
    streams: filteredStreams,
    loading: streamLoading,
    searchQuery,
    setSearchQuery
  };
};
