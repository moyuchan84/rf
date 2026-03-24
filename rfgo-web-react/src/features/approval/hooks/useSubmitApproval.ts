import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { SUBMIT_APPROVAL } from '../api/approvalMutations';
import { useApprovalPathStore } from '../store/useApprovalPathStore';
import toast from 'react-hot-toast';

export const useSubmitApproval = (requestId: number, onSave?: () => void) => {
  const { currentPath } = useApprovalPathStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitApprovalMutation, { loading }] = useMutation(SUBMIT_APPROVAL);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('제목을 입력해 주세요.');
      return;
    }
    if (currentPath.length === 0) {
      toast.error('결재선을 구성해 주세요.');
      return;
    }

    try {
      const { data } = await submitApprovalMutation({
        variables: {
          requestId,
          requesterId: 'EMP_123456', // 실제 유저 ID (Context에서 가져올 예정)
          title,
          path: currentPath.map(({ epId, userId, fullName, email, role, aplnStatsCode }) => ({
            epId, userId, fullName, email, role, aplnStatsCode
          })),
          content
        }
      }) as any;

      if (data.submitApproval.result === 'success') {
        toast.success('결재가 상신되었습니다.');
        onSave?.();
      } else {
        toast.error(data.submitApproval.message || '상신에 실패했습니다.');
      }
    } catch (err) {
      toast.error('오류가 발생했습니다.');
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    handleSubmit,
    loading,
    canSubmit: currentPath.length > 0 && title.trim().length > 0
  };
};
