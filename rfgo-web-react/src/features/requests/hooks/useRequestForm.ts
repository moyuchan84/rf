import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROCESS_PLANS } from '../../master-data/api/masterDataQueries';
import { CREATE_REQUEST_ITEM, UPDATE_REQUEST_ITEM } from '../api/requestQueries';
import { type ProcessPlan, type RequestItem } from '../../master-data/types';
import toast from 'react-hot-toast';

export const useRequestForm = (initialData?: RequestItem | null) => {
  const { data, loading, error } = useQuery<{ processPlans: ProcessPlan[] }>(GET_PROCESS_PLANS);
  const [createRequestMutation] = useMutation(CREATE_REQUEST_ITEM);
  const [updateRequestMutation] = useMutation(UPDATE_REQUEST_ITEM);

  // Selection state
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Form state
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterId, setRequesterId] = useState('');
  const [edmList, setEdmList] = useState<string[]>([]);
  const [pkdVersions, setPkdVersions] = useState<string[]>([]);
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Derived data
  const processPlans = useMemo(() => data?.processPlans || [], [data]);

  // Initialize form with initialData if editing
  useEffect(() => {
    if (initialData && processPlans.length > 0) {
      setRequestType(initialData.requestType);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setRequesterId(initialData.requesterId);
      setEdmList(initialData.edmList);
      setPkdVersions(initialData.pkdVersions);
      
      // Find parent IDs based on productId
      let foundPlanId: number | null = null;
      let foundOptionId: number | null = null;

      for (const plan of processPlans) {
        for (const option of plan.beolOptions) {
          if (option.products.some(p => p.id === initialData.productId)) {
            foundPlanId = plan.id;
            foundOptionId = option.id;
            break;
          }
        }
        if (foundPlanId) break;
      }

      setSelectedPlanId(foundPlanId);
      setSelectedOptionId(foundOptionId);
      setSelectedProductId(initialData.productId);
    }
  }, [initialData, processPlans]);
  
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
    setRequestType('');
    setTitle('');
    setDescription('');
    setEdmList([]);
    setPkdVersions([]);
    setRequesterId('');
    setIsSubmitted(false);
  };

  const submitRequest = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    const input = {
      productId: selectedProductId,
      requestType,
      title,
      description,
      edmList,
      pkdVersions,
      requesterId
    };

    try {
      if (initialData?.id) {
        await updateRequestMutation({
          variables: {
            id: initialData.id,
            input
          }
        });
        toast.success("Request updated successfully");
      } else {
        await createRequestMutation({
          variables: {
            input
          }
        });
        toast.success("Request created successfully");
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit request", err);
      toast.error("Failed to submit request");
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
    requestType,
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
    setRequestType,
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
