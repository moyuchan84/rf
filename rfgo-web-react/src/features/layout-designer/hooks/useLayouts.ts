import { useQuery, useMutation } from '@apollo/client/react';
import { GET_LAYOUTS, DELETE_LAYOUT } from '../api/layoutQueries';
import toast from 'react-hot-toast';

export const useLayouts = (productId: number) => {
  const { data, loading, error, refetch } = useQuery(GET_LAYOUTS, {
    variables: { productId },
    skip: !productId,
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

  return {
    layouts: data?.layouts || [],
    loading,
    error,
    refetch,
    deleteLayout
  };
};
