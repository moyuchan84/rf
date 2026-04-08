import { useQuery, useMutation } from '@apollo/client/react';
import { PAGINATED_LAYOUTS, DELETE_LAYOUT } from '../api/layoutQueries';
import toast from 'react-hot-toast';

export const useLayouts = (productId?: number | null, search?: string) => {
  const pageSize = 12;

  const { data, loading, error, fetchMore, refetch } = useQuery<{ 
    paginatedLayouts: { items: any[], totalCount: number } 
  }>(PAGINATED_LAYOUTS, {
    variables: { 
      skip: 0, 
      take: pageSize, 
      search: search || undefined, 
      productId: productId || undefined 
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const [deleteLayoutMutation] = useMutation(DELETE_LAYOUT, {
    onCompleted: () => {
      toast.success('Layout deleted successfully');
      refetch();
    },
    onError: (err) => {
      toast.error(`Delete failed: ${err.message}`);
    }
  });

  const deleteLayout = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) return;
    await deleteLayoutMutation({ variables: { id } });
  };

  const loadMore = () => {
    if (!data || loading) return;
    const currentCount = data.paginatedLayouts.items.length;
    if (currentCount >= data.paginatedLayouts.totalCount) return;

    fetchMore({
      variables: {
        skip: currentCount,
        take: pageSize,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          paginatedLayouts: {
            ...fetchMoreResult.paginatedLayouts,
            items: [
              ...prev.paginatedLayouts.items,
              ...fetchMoreResult.paginatedLayouts.items,
            ],
          },
        };
      },
    });
  };

  return {
    layouts: data?.paginatedLayouts.items || [],
    totalCount: data?.paginatedLayouts.totalCount || 0,
    loading,
    error,
    refetch,
    deleteLayout,
    loadMore,
    hasMore: data ? data.paginatedLayouts.items.length < data.paginatedLayouts.totalCount : false
  };
};
