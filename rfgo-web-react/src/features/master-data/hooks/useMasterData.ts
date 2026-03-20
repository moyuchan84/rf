import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_PROCESS_PLANS, 
  CREATE_PROCESS_PLAN, 
  CREATE_BEOL_OPTION, 
  CREATE_PRODUCT, 
  UPDATE_PRODUCT, 
  DELETE_PRODUCT 
} from '../api/masterDataQueries';
import { useMasterDataStore } from '../store/useMasterDataStore';
import type { ProcessPlan, ProductMeta } from '../types';

export const useMasterData = () => {
  const { data, loading, error, refetch } = useQuery<{ processPlans: ProcessPlan[] }>(GET_PROCESS_PLANS);
  const { selectedNode, setSelectedNode, isFormOpen, setIsFormOpen } = useMasterDataStore();

  const [createProcessPlanMutation] = useMutation(CREATE_PROCESS_PLAN);
  const [createBeolOptionMutation] = useMutation(CREATE_BEOL_OPTION);
  const [createProductMutation] = useMutation(CREATE_PRODUCT);
  const [updateProductMutation] = useMutation(UPDATE_PRODUCT);
  const [deleteProductMutation] = useMutation(DELETE_PRODUCT);

  const createProcessPlan = async (designRule: string) => {
    await createProcessPlanMutation({ variables: { input: { designRule } } });
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

  return {
    processPlans: data?.processPlans || [],
    loading,
    error,
    selectedNode,
    setSelectedNode,
    isFormOpen,
    setIsFormOpen,
    createProcessPlan,
    createBeolOption,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
};
