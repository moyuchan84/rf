import React, { useState } from 'react';
import { UserPlus, X, User, CheckCircle2 } from 'lucide-react';
import { type RequestAssignee } from '../../master-data/types';
import { useMutation } from '@apollo/client/react';
import { ASSIGN_USER, REMOVE_ASSIGNEE } from '../api/requestQueries';
import toast from 'react-hot-toast';
import { EmployeeSearch } from '../../employee/components/EmployeeSearch';
import { Employee } from '../../employee/store/useEmployeeStore';

interface AssigneeManagerProps {
  requestId: number;
  assignees: RequestAssignee[];
  onUpdate: () => void;
}

export const AssigneeManager: React.FC<AssigneeManagerProps> = ({ 
  requestId, 
  assignees,
  onUpdate 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('RFG_TASK');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [assignUserMutation] = useMutation(ASSIGN_USER, {
    onCompleted: () => {
      toast.success('Assignee added');
      onUpdate();
      setIsAdding(false);
      setSelectedEmployee(null);
    }
  });

  const [removeAssigneeMutation] = useMutation(REMOVE_ASSIGNEE, {
    onCompleted: () => {
      toast.success('Assignee removed');
      onUpdate();
    }
  });

  const handleAdd = async () => {
    if (!selectedEmployee) return;

    // Remove __typename for clean JSON storage
    const { __typename, ...employeeData } = selectedEmployee as any;

    await assignUserMutation({
      variables: {
        input: { 
          requestId, 
          category, 
          userId: selectedEmployee.userId, 
          userName: selectedEmployee.fullName,
          user: employeeData
        }
      }
    });
  };

  const handleRemove = async (id: number) => {
    await removeAssigneeMutation({ variables: { id } });
  };

  return (
    <div className="bg-slate-50/30 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-md p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Task Assignees</h3>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setSelectedEmployee(null);
          }}
          className={`p-2 rounded-md border transition-all active:scale-90 ${
            isAdding 
              ? 'bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' 
              : 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
          }`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="RFG_TASK">RFG Task</option>
              <option value="KEY_TABLE_TASK">Key Table Task</option>
              {/* <option value="INNO_TASK">Innovation Task</option> */}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Employee</label>
            <EmployeeSearch 
              onSelect={setSelectedEmployee}
              placeholder="Search by Name or ID..."
            />
          </div>

          {selectedEmployee && (
            <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 rounded-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-md flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{selectedEmployee.fullName}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{selectedEmployee.departmentName} ({selectedEmployee.userId})</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          )}

          <button 
            onClick={handleAdd}
            disabled={!selectedEmployee}
            className={`w-full py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              selectedEmployee 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            Add Assignee
          </button>
        </div>
      )}

      <div className="space-y-3">
        {assignees.map((assignee) => (
          <div 
            key={assignee.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-md group shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-600/10 rounded-md flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{assignee.category}</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">{assignee.userName} ({assignee.userId})</p>
              </div>
            </div>
            <button 
              onClick={() => handleRemove(assignee.id)}
              className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {assignees.length === 0 && (
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold text-center py-4 italic uppercase">No assignees designated</p>
        )}
      </div>
    </div>
  );
};
