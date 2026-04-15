import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { 
  GET_PROCESS_PLANS, 
  CREATE_PROCESS_PLAN, 
  CREATE_BEOL_GROUP,
  CREATE_BEOL_OPTION, 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT, 
  DELETE_PRODUCT,
  DELETE_PROCESS_PLAN,
  DELETE_BEOL_GROUP,
  DELETE_BEOL_OPTION,
  GET_UNIQUE_PROCESS_GROUPS,
  GET_UNIQUE_BEOLS
} from '../api/masterDataQueries';
import { useMasterDataStore } from '../store/useMasterDataStore';
import type { ProcessPlan, ProductMeta } from '../types';

export const useMasterData = () => {
  const { data, loading, error, refetch } = useQuery<{ processPlans: ProcessPlan[] }>(GET_PROCESS_PLANS);
  const { selectedNode, setSelectedNode, isFormOpen, setIsFormOpen } = useMasterDataStore();

  const [createProcessPlanMutation] = useMutation(CREATE_PROCESS_PLAN);
  const [createBeolGroupMutation] = useMutation(CREATE_BEOL_GROUP);
  const [createBeolOptionMutation] = useMutation(CREATE_BEOL_OPTION);
  const [createProductMutation] = useMutation(CREATE_PRODUCT);
  const [updateProductMutation] = useMutation(UPDATE_PRODUCT);
  const [deleteProductMutation] = useMutation(DELETE_PRODUCT);
  const [deleteProcessPlanMutation] = useMutation(DELETE_PROCESS_PLAN);
  const [deleteBeolGroupMutation] = useMutation(DELETE_BEOL_GROUP);
  const [deleteBeolOptionMutation] = useMutation(DELETE_BEOL_OPTION);

  const [fetchProcessGroups, { data: processGroupsData, loading: loadingProcessGroups }] = useLazyQuery<{ uniqueProcessGroups: string[] }>(GET_UNIQUE_PROCESS_GROUPS);
  const [fetchBeols, { data: beolsData, loading: loadingBeols }] = useLazyQuery<{ uniqueBeols: string[] }>(GET_UNIQUE_BEOLS);

  const createProcessPlan = async (designRule: string) => {
    await createProcessPlanMutation({ variables: { input: { designRule } } });
    await refetch();
  };

  const createBeolGroup = async (processPlanId: number, groupName: string) => {
    await createBeolGroupMutation({ variables: { input: { processPlanId, groupName } } });
    await refetch();
  };

  const createBeolOption = async (processPlanId: number, optionName: string) => {
    await createBeolOptionMutation({ variables: { input: { processPlanId, optionName } } });
    await refetch();
  };

  const createProduct = async (beolOptionId: number, partId: string, productName: string, meta?: Partial<ProductMeta>) => {
    await createProductMutation({ 
      variables: { 
        input: { beolOptionId, partId, productName, metaInfo: meta } 
      } 
    });
    await refetch();
  };

  const updateProduct = async (id: number, productName: string, meta?: Partial<ProductMeta>) => {
    await updateProductMutation({ 
      variables: { 
        id, 
        input: { productName, metaInfo: meta } 
      } 
    });
    await refetch();
  };

  const deleteProduct = async (id: number) => {
    await deleteProductMutation({ variables: { id } });
    await refetch();
  };

  const deleteProcessPlan = async (id: number) => {
    await deleteProcessPlanMutation({ variables: { id } });
    await refetch();
  };

  const deleteBeolGroup = async (id: number) => {
    await deleteBeolGroupMutation({ variables: { id } });
    await refetch();
  };

  const deleteBeolOption = async (id: number) => {
    await deleteBeolOptionMutation({ variables: { id } });
    await refetch();
  };

  return {
    processPlans: data?.processPlans || [],
    loading,
    error,
    selectedNode,
    setSelectedNode,
    isFormOpen,
    setIsFormOpen,
    createProcessPlan,
    createBeolGroup,
    createBeolOption,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProcessPlan,
    deleteBeolGroup,
    deleteBeolOption,
    refetch,
    // Lookups
    fetchProcessGroups,
    processGroups: processGroupsData?.uniqueProcessGroups || [],
    loadingProcessGroups,
    fetchBeols,
    beols: beolsData?.uniqueBeols || [],
    loadingBeols,
  };
};
