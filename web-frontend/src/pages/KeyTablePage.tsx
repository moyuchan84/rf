import React, { useMemo } from 'react';
import { useMasterData } from '../features/master-data/hooks/useMasterData';
import { useKeyTableStore } from '../features/key-table/store/useKeyTableStore';
import { HierarchyExplorer } from '../features/key-table/components/HierarchyExplorer';
import { PhotoKeyDetail } from '../features/key-table/components/PhotoKeyDetail';
import { PhotoKeyList } from '../features/key-table/components/PhotoKeyList';

const KeyTablePage: React.FC = () => {
  const { processPlans: rawHierarchy, loading: hierarchyLoading, refetch } = useMasterData();
  const { 
    selectedKey,
    selectedPlanId,
    selectedOptionId,
    selectedProductId 
  } = useKeyTableStore();

  // Hierarchy Logic for Breadcrumbs/Header
  const hierarchy = useMemo(() => rawHierarchy || [], [rawHierarchy]);
  
  const selectedPlan = useMemo(() => hierarchy.find(p => p.id === selectedPlanId), [hierarchy, selectedPlanId]);
  const selectedOption = useMemo(() => selectedPlan?.beolOptions.find(o => o.id === selectedOptionId), [selectedPlan, selectedOptionId]);
  const selectedProduct = useMemo(() => selectedOption?.products.find(p => p.id === selectedProductId), [selectedOption, selectedProductId]);

  if (selectedKey) {
    return <PhotoKeyDetail />;
  }

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      <HierarchyExplorer 
        hierarchy={hierarchy}
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
