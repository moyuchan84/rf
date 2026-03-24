import { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { 
  GET_MY_APPROVAL_PATHS, 
  SAVE_APPROVAL_PATH, 
  UPDATE_APPROVAL_PATH, 
  DELETE_APPROVAL_PATH 
} from '../api/approvalQueries';
import { useApprovalPathStore } from '../store/useApprovalPathStore';
import { useUserStore } from '@/features/auth/store/useUserStore';
import toast from 'react-hot-toast';

export const useApprovalPaths = () => {
  const { user } = useUserStore();
  const userId = user?.userId || '';
  const { loadFavorites } = useApprovalPathStore();

  const { data, loading, refetch } = useQuery(GET_MY_APPROVAL_PATHS, {
    variables: { userId },
    skip: !userId
  });

  useEffect(() => {
    if (data?.getMyApprovalPaths) {
      loadFavorites(data.getMyApprovalPaths);
    }
  }, [data, loadFavorites]);

  const [savePathMutation] = useMutation(SAVE_APPROVAL_PATH);
  const [updatePathMutation] = useMutation(UPDATE_APPROVAL_PATH);
  const [deletePathMutation] = useMutation(DELETE_APPROVAL_PATH);

  // Helper to clean items for GraphQL Input
  const prepareItems = (items: any[]) => {
    return items.map(({ epId, userId, fullName, email, role, aplnStatsCode }) => ({
      epId, userId, fullName, email, role, aplnStatsCode
    }));
  };

  const createPath = async (pathName: string, pathItems: any[]) => {
    if (!userId) return;
    try {
      await savePathMutation({
        variables: {
          userId,
          input: { 
            pathName, 
            pathItems: prepareItems(pathItems) 
          }
        }
      });
      toast.success('결재선이 저장되었습니다.');
      refetch();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('저장 실패: ' + (err as any).message);
    }
  };

  const updatePath = async (id: number, pathName: string, pathItems: any[]) => {
    try {
      await updatePathMutation({
        variables: {
          id,
          input: { 
            pathName, 
            pathItems: prepareItems(pathItems) 
          }
        }
      });
      toast.success('결재선이 수정되었습니다.');
      refetch();
    } catch (err) {
      toast.error('수정 실패');
    }
  };

  const deletePath = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePathMutation({ variables: { id } });
      toast.success('삭제되었습니다.');
      refetch();
    } catch (err) {
      toast.error('삭제 실패');
    }
  };

  return {
    favorites: data?.getMyApprovalPaths || [],
    loading,
    createPath,
    updatePath,
    deletePath
  };
};
