import { useQuery } from '@apollo/client/react';
import { GET_REQUESTS_BY_PRODUCT } from '../api/requestQueries';
import { type RequestItem } from '../../master-data/types';

export const useRequestsList = (productId?: number | null) => {
  const { data, loading, error, refetch } = useQuery<{ requestItemsByProduct: RequestItem[] }>(
    GET_REQUESTS_BY_PRODUCT,
    {
      variables: { productId },
      skip: !productId,
    }
  );

  return {
    requests: data?.requestItemsByProduct || [],
    loading,
    error,
    refetch,
  };
};
