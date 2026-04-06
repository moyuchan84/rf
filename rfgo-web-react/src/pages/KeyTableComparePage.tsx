import React, { useEffect } from 'react';
import { TableCompareSelector } from '../features/key-table/components/TableCompareSelector';
import { PhotoKeyDiffModal } from '../features/key-table/components/PhotoKeyDiffModal';
import { useKeyTableCompareStore } from '../features/key-table/store/useKeyTableCompareStore';

const KeyTableComparePage: React.FC = () => {
  const { compareTarget, setCompareTarget, resetSelection } = useKeyTableCompareStore();

  // Reset store when leaving page
  useEffect(() => {
    return () => {
      resetSelection();
    };
  }, [resetSelection]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <TableCompareSelector />
      
      {compareTarget && (
        <PhotoKeyDiffModal
          baseId={compareTarget.baseId}
          targetId={compareTarget.targetId}
          baseTitle={compareTarget.baseTitle}
          targetTitle={compareTarget.targetTitle}
          onClose={() => setCompareTarget(null)}
        />
      )}
    </div>
  );
};

export default KeyTableComparePage;
