import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROCESS_PLANS } from '../../master-data/api/masterDataQueries';
import { CREATE_REQUEST_ITEM } from '../api/requestQueries';
import { type ProcessPlan } from '../../master-data/types';

export const useRequestForm = () => {
  const { data, loading, error } = useQuery<{ processPlans: ProcessPlan[] }>(GET_PROCESS_PLANS);
  const [createRequestMutation] = useMutation(CREATE_REQUEST_ITEM);

  // Selection state
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterId, setRequesterId] = useState('');
  const [edmList, setEdmList] = useState<string[]>([]);
  const [pkdVersions, setPkdVersions] = useState<string[]>([]);
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Derived data
  const processPlans = useMemo(() => data?.processPlans || [], [data]);
  
  const selectedPlan = useMemo(() => 
    processPlans.find((p) => p.id === selectedPlanId), 
    [processPlans, selectedPlanId]
  );
  
  const selectedOption = useMemo(() => 
    selectedPlan?.beolOptions.find((o) => o.id === selectedOptionId), 
    [selectedPlan, selectedOptionId]
  );
  
  const selectedProduct = useMemo(() => 
    selectedOption?.products.find((p) => p.id === selectedProductId), 
    [selectedOption, selectedProductId]
  );

  const handleAddEdm = (url: string) => {
    if (url && !edmList.includes(url)) {
      setEdmList([...edmList, url]);
    }
  };

  const handleRemoveEdm = (url: string) => {
    setEdmList(edmList.filter((item) => item !== url));
  };

  const handleAddPdk = (version: string) => {
    if (version && !pkdVersions.includes(version)) {
      setPkdVersions([...pkdVersions, version]);
    }
  };

  const handleRemovePdk = (version: string) => {
    setPkdVersions(pkdVersions.filter((item) => item !== version));
  };

  const resetForm = () => {
    setSelectedPlanId(null);
    setSelectedOptionId(null);
    setSelectedProductId(null);
    setTitle('');
    setDescription('');
    setEdmList([]);
    setPkdVersions([]);
    setRequesterId('');
    setIsSubmitted(false);
  };

  const submitRequest = async () => {
    if (!selectedProductId) return;

    try {
      await createRequestMutation({
        variables: {
          input: {
            productId: selectedProductId,
            title,
            description,
            edmList,
            pkdVersions,
            requesterId
          }
        }
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to create request", err);
      throw err;
    }
  };

  return {
    // Data
    processPlans,
    loading,
    error,
    selectedPlanId,
    selectedOptionId,
    selectedProductId,
    selectedPlan,
    selectedOption,
    selectedProduct,
    
    // Form State
    title,
    description,
    requesterId,
    edmList,
    pkdVersions,
    isSubmitted,
    
    // Setters
    setSelectedPlanId,
    setSelectedOptionId,
    setSelectedProductId,
    setTitle,
    setDescription,
    setRequesterId,
    setIsSubmitted,
    
    // Actions
    handleAddEdm,
    handleRemoveEdm,
    handleAddPdk,
    handleRemovePdk,
    submitRequest,
    resetForm
  };
};
