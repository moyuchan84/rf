import React, { useMemo } from 'react';
import { useMasterData } from '../features/master-data/hooks/useMasterData';
import { useKeyTableStore } from '../features/key-table/store/useKeyTableStore';
import { HierarchyExplorer } from '../features/key-table/components/HierarchyExplorer';
import { PhotoKeyDetail } from '../features/key-table/components/PhotoKeyDetail';
import { PhotoKeyList } from '../features/key-table/components/PhotoKeyList';
import { ProcessPlan, BeolOption, Product } from '../features/master-data/types';

const KeyTablePage: React.FC = () => {
  const { processPlans: rawHierarchy, loading: hierarchyLoading, refetch } = useMasterData();
  const { 
    selectedKey,
    selectedPlanId,
    selectedOptionId,
    selectedProductId 
  } = useKeyTableStore();
  
  // Use a separate memo to persist data during refresh if rawHierarchy becomes empty
  const [persistentHierarchy, setPersistentHierarchy] = React.useState<ProcessPlan[]>([]);
  
  React.useEffect(() => {
    if (rawHierarchy && rawHierarchy.length > 0) {
      setPersistentHierarchy(rawHierarchy);
    }
  }, [rawHierarchy]);

  const displayHierarchy = rawHierarchy && rawHierarchy.length > 0 ? rawHierarchy : persistentHierarchy;

  const selectedPlan = useMemo(() => displayHierarchy.find((p: ProcessPlan) => p.id === selectedPlanId), [displayHierarchy, selectedPlanId]);
  const selectedOption = useMemo(() => selectedPlan?.beolOptions.find((o: BeolOption) => o.id === selectedOptionId), [selectedPlan, selectedOptionId]);
  const selectedProduct = useMemo(() => selectedOption?.products.find((p: Product) => p.id === selectedProductId), [selectedOption, selectedProductId]);

  if (selectedKey) {
    return <PhotoKeyDetail />;
  }

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      <HierarchyExplorer 
        hierarchy={displayHierarchy}
        loading={hierarchyLoading}
        onRefresh={refetch}
      />

      <PhotoKeyList 
        designRule={selectedPlan?.designRule}
        optionName={selectedOption?.optionName}
        partId={selectedProduct?.partId}
      />
    </div>
  );
};

export default KeyTablePage;
