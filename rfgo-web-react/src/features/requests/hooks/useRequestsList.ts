import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ALL_REQUESTS, DELETE_REQUEST_ITEM } from '../api/requestQueries';
import { 
  GetAllRequestsQuery, 
  GetAllRequestsQueryVariables,
  DeleteRequestItemMutation, 
  DeleteRequestItemMutationVariables 
} from '@/shared/api/generated/graphql';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useRequestsList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [requestType, setRequestType] = useState<string | null>(null);
  const [processPlanId, setProcessPlanId] = useState<number | null>(null);
  const [beolOptionId, setBeolOptionId] = useState<number | null>(null);

  const { data, loading, refetch } = useQuery<GetAllRequestsQuery, GetAllRequestsQueryVariables>(GET_ALL_REQUESTS, {
    variables: {
      search: search || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      requestType: requestType || undefined,
      processPlanId: processPlanId || undefined,
      beolOptionId: beolOptionId || undefined,
    },
    notifyOnNetworkStatusChange: true
  });

  const [deleteRequestMutation] = useMutation<DeleteRequestItemMutation, DeleteRequestItemMutationVariables>(DELETE_REQUEST_ITEM, {
    onCompleted: () => {
      toast.success('Request deleted successfully');
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to delete request: ${err.message}`);
    }
  });

  const deleteRequest = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      await deleteRequestMutation({ variables: { id } });
    }
  };

  const totalCount = data?.requestItems.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    requests: data?.requestItems.items || [],
    totalCount,
    totalPages,
    loading,
    refetch,
    deleteRequest,
    // State & Setters
    search,
    setSearch: (val: string) => { setSearch(val); setPage(1); },
    page,
    setPage,
    pageSize,
    setPageSize,
    requestType,
    setRequestType: (val: string | null) => { setRequestType(val); setPage(1); },
    processPlanId,
    setProcessPlanId: (val: number | null) => { setProcessPlanId(val); setPage(1); setBeolOptionId(null); },
    beolOptionId,
    setBeolOptionId: (val: number | null) => { setBeolOptionId(val); setPage(1); }
  };
};
