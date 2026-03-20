import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { GET_ME } from '../api/authQueries';
import { useUserStore, User } from '../store/useUserStore';

interface GetMeData {
  me: User | null;
}

export const useAuth = () => {
  const { data, loading, error, refetch } = useQuery<GetMeData>(GET_ME, {
    fetchPolicy: 'network-only',
  });
  
  const setUser = useUserStore((state) => state.setUser);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    if (!loading && data?.me) {
      setUser(data.me);
    } else if (!loading && (error || !data?.me)) {
      setUser(null);
    }
  }, [data, loading, error, setUser]);

  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999'}/auth/sso/login`;
  };

  return {
    user: data?.me,
    loading: loading || isLoading,
    error,
    login,
    refetch,
  };
};
