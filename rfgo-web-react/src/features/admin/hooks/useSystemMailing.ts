import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_ALL_SYSTEM_DEFAULT_MAILERS, 
  UPDATE_SYSTEM_DEFAULT_MAILER 
} from '../api/adminQueries';
import { SystemDefaultMailer } from '../types';
import { Employee } from '@/features/employee/store/useEmployeeStore';
import toast from 'react-hot-toast';

export const useSystemMailing = () => {
  const { data, loading, error, refetch } = useQuery<{ allSystemDefaultMailers: SystemDefaultMailer[] }>(
    GET_ALL_SYSTEM_DEFAULT_MAILERS
  );

  const [updateMutation, { loading: isUpdating }] = useMutation(UPDATE_SYSTEM_DEFAULT_MAILER, {
    onCompleted: () => {
      toast.success('System mailer updated successfully');
      refetch();
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    }
  });

  const updateMailer = async (category: string, recipients: Employee[]) => {
    // Clean data: remove __typename
    const cleanRecipients = recipients.map(({ epId, fullName, userId, departmentName, emailAddress }) => ({
      epId, fullName, userId, departmentName, emailAddress
    }));

    await updateMutation({
      variables: {
        category,
        recipients: cleanRecipients
      }
    });
  };

  return {
    mailers: data?.allSystemDefaultMailers || [],
    isLoading: loading,
    isUpdating,
    error,
    updateMailer,
    refresh: refetch
  };
};
