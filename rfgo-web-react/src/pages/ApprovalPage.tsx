import React from 'react';
import { ApprovalPathGroupManager } from '../features/approval/components/ApprovalPathGroupManager';

const ApprovalPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">    
      <div className="w-full h-full">
        <ApprovalPathGroupManager />
      </div>
    </div>
  );
};

export default ApprovalPage;
