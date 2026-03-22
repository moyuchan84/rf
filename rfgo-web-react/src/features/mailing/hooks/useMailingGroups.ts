// rfgo-web-react/src/features/mailing/hooks/useMailingGroups.ts
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_MY_MAIL_GROUPS, 
  CREATE_MAIL_GROUP, 
  UPDATE_MAIL_GROUP,
  DELETE_MAIL_GROUP 
} from '../api/mailingQueries';
import { useUserStore } from '../../auth/store/useUserStore';
import { EmployeeDto, UserMailGroup } from '../store/useMailSelectorStore';

export const useMailingGroups = () => {
  const user = useUserStore((state) => state.user);
  const userId = user?.userId || '';

  const { data, loading, error, refetch } = useQuery<{ myMailGroups: UserMailGroup[] }>(GET_MY_MAIL_GROUPS, {
    variables: { userId },
    skip: !userId,
  });

  const [createGroupMutation] = useMutation(CREATE_MAIL_GROUP, {
    onCompleted: () => refetch(),
  });

  const [updateGroupMutation] = useMutation(UPDATE_MAIL_GROUP, {
    onCompleted: () => refetch(),
  });

  const [deleteGroupMutation] = useMutation(DELETE_MAIL_GROUP, {
    onCompleted: () => refetch(),
  });

  const createGroup = async (groupName: string, members: EmployeeDto[]) => {
    if (!userId) return;
    
    // Clean members: remove __typename and other metadata that doesn't belong in EmployeeInput
    const cleanedMembers = members.map(({ __typename, addedAt, isMute, ...rest }: any) => rest);

    return createGroupMutation({
      variables: {
        userId,
        input: { groupName, members: cleanedMembers },
      },
    });
  };

  const updateGroup = async (id: number, groupName: string, members: EmployeeDto[]) => {
    if (!userId) return;
    
    const cleanedMembers = members.map(({ __typename, addedAt, isMute, ...rest }: any) => rest);

    return updateGroupMutation({
      variables: {
        id,
        userId,
        input: { groupName, members: cleanedMembers },
      },
    });
  };

  const deleteGroup = async (id: number) => {
    if (!userId) return;
    return deleteGroupMutation({
      variables: { id, userId },
    });
  };

  return {
    groups: data?.myMailGroups || [],
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch,
  };
};
