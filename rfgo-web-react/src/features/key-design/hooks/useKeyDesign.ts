import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_KEY_DESIGNS, CREATE_KEY_DESIGN, UPDATE_KEY_DESIGN, DELETE_KEY_DESIGN } from '../api/keyDesignQueries';
import { KeyDesign, CreateKeyDesignInput, UpdateKeyDesignInput } from '../types';
import { useKeyDesignStore } from '../store/keyDesignStore';
import toast from 'react-hot-toast';

export const useKeyDesign = (filters?: { search?: string; keyType?: string; processPlanId?: number | null }) => {
  const { setKeyDesigns } = useKeyDesignStore();

  const { loading, error, data, refetch } = useQuery<{ keyDesigns: KeyDesign[] }>(GET_KEY_DESIGNS, {
    variables: {
      search: filters?.search || undefined,
      keyType: filters?.keyType || undefined,
      processPlanId: filters?.processPlanId || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.keyDesigns) {
      setKeyDesigns(data.keyDesigns);
    }
  }, [data, setKeyDesigns]);


  const [createMutation] = useMutation(CREATE_KEY_DESIGN, {
    onCompleted: () => {
      toast.success('Key Design created successfully');
      refetch();
    },
    onError: (error:any) => {
      toast.error(`Error creating Key Design: ${error.message}`);
    },
  });

  const [updateMutation] = useMutation(UPDATE_KEY_DESIGN, {
    onCompleted: () => {
      toast.success('Key Design updated successfully');
      refetch();
    },
    onError: (error:any) => {
      toast.error(`Error updating Key Design: ${error.message}`);
    },
  });

  const [deleteMutation] = useMutation(DELETE_KEY_DESIGN, {
    onCompleted: () => {
      toast.success('Key Design deleted successfully');
      refetch();
    },
    onError: (error:any) => {
      toast.error(`Error deleting Key Design: ${error.message}`);
    },
  });

  const createKeyDesign = (input: CreateKeyDesignInput) => {
    return createMutation({ variables: { input } });
  };

  const updateKeyDesign = (id: number, input: UpdateKeyDesignInput) => {
    return updateMutation({ variables: { id, input } });
  };

  const deleteKeyDesign = (id: number) => {
    if (window.confirm('Are you sure you want to delete this key design?')) {
      return deleteMutation({ variables: { id } });
    }
  };

  return {
    keyDesigns: data?.keyDesigns || [],
    loading,
    error,
    createKeyDesign,
    updateKeyDesign,
    deleteKeyDesign,
    refetch,
  };
};
