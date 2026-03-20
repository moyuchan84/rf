import { useQuery, useMutation } from '@apollo/client/react';
import { GET_REQUESTS_BY_PRODUCT, GET_ALL_REQUESTS, DELETE_REQUEST_ITEM } from '../api/requestQueries';
import { type RequestItem } from '../../master-data/types';
import toast from 'react-hot-toast';

export const useRequestsList = (productId?: number | null) => {
  const query = productId ? GET_REQUESTS_BY_PRODUCT : GET_ALL_REQUESTS;
  const variables = productId ? { productId } : {};

  const { data, loading, error, refetch } = useQuery<{ requestItemsByProduct?: RequestItem[], requestItems?: RequestItem[] }>(
    query,
    {
      variables,
    }
  );

  const [deleteRequestMutation] = useMutation(DELETE_REQUEST_ITEM, {
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

  return {
    requests: productId ? data?.requestItemsByProduct || [] : data?.requestItems || [],
    loading,
    error,
    refetch,
    deleteRequest,
  };
};
