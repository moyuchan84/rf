import React, { useState } from 'react';
import { UserPlus, X, User } from 'lucide-react';
import { type RequestAssignee } from '../../master-data/types';
import { useMutation } from '@apollo/client/react';
import { ASSIGN_USER, REMOVE_ASSIGNEE } from '../api/requestQueries';
import toast from 'react-hot-toast';

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
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  const [assignUserMutation] = useMutation(ASSIGN_USER, {
    onCompleted: () => {
      toast.success('Assignee added');
      onUpdate();
      setIsAdding(false);
      setUserId('');
      setUserName('');
    }
  });

  const [removeAssigneeMutation] = useMutation(REMOVE_ASSIGNEE, {
    onCompleted: () => {
      toast.success('Assignee removed');
      onUpdate();
    }
  });

  const handleAdd = async () => {
    if (!userId || !userName) return;
    await assignUserMutation({
      variables: {
        input: { requestId, category, userId, userName }
      }
    });
  };

  const handleRemove = async (id: number) => {
    await removeAssigneeMutation({ variables: { id } });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Task Assignees</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg hover:bg-indigo-600/20 transition-all active:scale-90"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none"
          >
            <option value="RFG_TASK">RFG Task</option>
            <option value="KEY_TABLE_TASK">Key Table Task</option>
            <option value="INNO_TASK">Innovation Task</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder="User ID (EMP...)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none placeholder:text-slate-700"
            />
            <input 
              type="text" 
              placeholder="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none placeholder:text-slate-700"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors"
          >
            Add Assignee
          </button>
        </div>
      )}

      <div className="space-y-3">
        {assignees.map((assignee) => (
          <div 
            key={assignee.id}
            className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{assignee.category}</p>
                <p className="text-xs font-black text-white">{assignee.userName} ({assignee.userId})</p>
              </div>
            </div>
            <button 
              onClick={() => handleRemove(assignee.id)}
              className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {assignees.length === 0 && (
          <p className="text-[10px] text-slate-600 font-bold text-center py-4 italic uppercase">No assignees designated</p>
        )}
      </div>
    </div>
  );
};
