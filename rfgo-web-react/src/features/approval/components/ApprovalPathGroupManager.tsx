import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApprovalPathStore } from '../store/useApprovalPathStore';
import { ApprovalPathItem, UserApprovalPath } from '../types';
import { useApprovalPaths } from '../hooks/useApprovalPaths';

// Sub-components
import { PathGroupForm } from './PathGroup/PathGroupForm';
import { PathGroupList } from './PathGroup/PathGroupList';

export const ApprovalPathGroupManager: React.FC = () => {
  const { createPath, updatePath, deletePath, loading } = useApprovalPaths();
  const { favorites } = useApprovalPathStore();
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingPath, setEditingPath] = useState<UserApprovalPath | null>(null);

  const handleSave = async (name: string, items: ApprovalPathItem[]) => {
    if (editingPath) {
      await updatePath(editingPath.id, name, items);
    } else {
      await createPath(name, items);
    }
    resetForm();
  };

  const handleEditClick = (path: UserApprovalPath) => {
    setEditingPath(path);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingPath(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">          
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              My Approval Lines
            </h2>
            <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              Manage personal approval path templates
            </p>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Create Path
          </button>
        )}
      </div>

      {isAdding && (
        <PathGroupForm 
          editingPath={editingPath}
          onSave={handleSave}
          onCancel={resetForm}
        />
      )}

      {/* Group List */}
      <PathGroupList 
        favorites={favorites}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={deletePath}
      />
    </div>
  );
};
