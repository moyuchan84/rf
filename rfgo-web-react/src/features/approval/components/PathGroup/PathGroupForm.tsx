import React, { useState, useEffect } from 'react';
import { X, Save, Users, ChevronUp, ChevronDown, ShieldCheck } from 'lucide-react';
import { EmployeeSearch } from '../../../employee/components/EmployeeSearch';
import { ApprovalPathItem, UserApprovalPath, ApprovalRole, APPROVAL_ROLE_LABELS } from '../../types';

interface PathGroupFormProps {
  editingPath: UserApprovalPath | null;
  onSave: (name: string, items: ApprovalPathItem[]) => Promise<void>;
  onCancel: () => void;
}

export const PathGroupForm: React.FC<PathGroupFormProps> = ({ editingPath, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [items, setItems] = useState<ApprovalPathItem[]>([]);

  useEffect(() => {
    if (editingPath) {
      setName(editingPath.pathName);
      setItems([...editingPath.pathItems]);
    } else {
      setName('');
      setItems([]);
    }
  }, [editingPath]);

  const handleAddApprover = (emp: any) => {
    if (items.some(m => m.epId === emp.epId)) return;
    setItems([...items, {
      epId: emp.epId,
      userId: emp.userId,
      fullName: emp.fullName,
      email: emp.emailAddress || emp.email || '',
      role: '1', // Default: 결재
      aplnStatsCode: '0'
    }]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setItems(newItems);
  };

  const handleRemove = (epId: string) => {
    setItems(items.filter(item => item.epId !== epId));
  };

  const handleRoleChange = (epId: string, role: string) => {
    setItems(items.map(item => item.epId === epId ? { ...item, role } : item));
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-6 animate-in slide-in-from-top-2 duration-300 shadow-sm relative overflow-hidden group/form">
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover/form:scale-110 transition-transform duration-700 pointer-events-none">
        <ShieldCheck className="w-32 h-32" />
      </div>

      <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {editingPath ? 'Edit Approval Path' : 'Create New Path'}
        </h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400">
          <X className="w-4 h-4"/>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-5 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Path Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 공정 파트장 결재선, 기획팀 합의선..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search & Add Members</label>
            <div className="p-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 h-[300px] overflow-hidden">
              <EmployeeSearch onSelect={handleAddApprover} className="w-full h-full" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Path Structure ({items.length})
          </label>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md p-3 min-h-[300px] max-h-[420px] overflow-y-auto content-start shadow-inner space-y-2 custom-scrollbar">
            {items.length > 0 ? (
              items.map((m, idx) => (
                <div key={m.epId} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-sm shadow-sm group animate-in slide-in-from-left-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleMoveUp(idx)} className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0" disabled={idx === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleMoveDown(idx)} className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0" disabled={idx === items.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">{m.fullName}</div>
                    <div className="text-[8px] font-bold text-slate-400 leading-none">{m.email}</div>
                  </div>
                  <select 
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.epId, e.target.value)}
                    className="text-[9px] font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm px-2 py-1 outline-none"
                  >                        
                    {Object.values(ApprovalRole).map((role) => (
                      <option key={role} value={role}>
                        {APPROVAL_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleRemove(m.epId)} className="p-1 text-slate-300 hover:text-red-500 transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 py-20 opacity-50">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest text-center">No members added to the path</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <button onClick={onCancel} className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-widest transition-colors">Cancel</button>
        <button 
          onClick={() => onSave(name, items)}
          disabled={!name.trim() || items.length === 0}
          className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
        >
          <Save className="w-3.5 h-3.5" /> {editingPath ? 'Update Path' : 'Save Path'}
        </button>
      </div>
    </div>
  );
};
