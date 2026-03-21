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
import { type RequestItem } from '../../master-data/types';

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
      requestType: (requestType as any) || undefined,
      processPlanId: (processPlanId as any) || undefined,
      beolOptionId: (beolOptionId as any) || undefined,
    } as any,
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

  // GraphQL Paginated Response structure mapping
  const requestItemsData = data?.requestItems as any;
  const requests = (requestItemsData?.items as RequestItem[]) || [];
  const totalCount = (requestItemsData?.totalCount as number) || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    requests,
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
