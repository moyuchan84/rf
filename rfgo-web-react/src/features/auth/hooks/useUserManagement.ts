import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_USERS, 
  GET_ROLES, 
  UPDATE_USER_ROLE 
} from '../api/authQueries';
import { 
  GetUsersQuery, 
  GetUsersQueryVariables,
  GetRolesQuery, 
  UpdateUserRoleMutation, 
  UpdateUserRoleMutationVariables 
} from '@/shared/api/generated/graphql';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export const useUserManagement = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery<GetUsersQuery, GetUsersQueryVariables>(GET_USERS, {
    variables: {
      search: search || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize
    },
    notifyOnNetworkStatusChange: true
  });

  const { data: rolesData, loading: rolesLoading } = useQuery<GetRolesQuery>(GET_ROLES);
  const [updateRoleMutation] = useMutation<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>(UPDATE_USER_ROLE);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleRoleChange = async (userId: number, roleId: number) => {
    setUpdatingId(userId);
    try {
      await updateRoleMutation({
        variables: { userId, roleId }
      });
      toast.success('User role updated successfully');
      await refetchUsers();
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = usersData?.users.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users: usersData?.users.items || [],
    roles: rolesData?.roles || [],
    isLoading: usersLoading || rolesLoading,
    updatingId,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1); // Reset to first page on search
    },
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    handleRoleChange,
    refetchUsers
  };
};
