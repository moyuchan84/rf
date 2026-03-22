// rfgo-web-react/src/features/mailing/components/MailGroupManager.tsx
import React, { useState } from 'react';
import { useMailingGroups } from '../hooks/useMailingGroups';
import { EmployeeSearch } from '../../employee/components/EmployeeSearch';
import { EmployeeDto, UserMailGroup } from '../store/useMailSelectorStore';
import { Plus, Trash2, Users, User, X, Save } from 'lucide-react';

export const MailGroupManager: React.FC = () => {
  const { groups, createGroup, updateGroup, deleteGroup, loading } = useMailingGroups();
  
  // New/Edit Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<EmployeeDto[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const handleAddMember = (emp: EmployeeDto) => {
    const alreadyExists = newGroupMembers.some(m => (m.userId || m.epId) === (emp.userId || emp.epId));
    if (!alreadyExists) {
      setNewGroupMembers([...newGroupMembers, emp]);
    }
  };

  const handleRemoveMember = (id: string) => {
    setNewGroupMembers(newGroupMembers.filter(m => (m.userId || m.epId) !== id));
  };

  const handleSaveGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;
    try {
      if (editingGroupId) {
        await updateGroup(editingGroupId, newGroupName, newGroupMembers);
      } else {
        await createGroup(newGroupName, newGroupMembers);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save group:', err);
    }
  };

  const handleEditClick = (group: UserMailGroup) => {
    setEditingGroupId(group.id);
    setNewGroupName(group.groupName);
    setNewGroupMembers(group.members);
    setIsAdding(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewGroupName('');
    setNewGroupMembers([]);
    setIsAdding(false);
    setEditingGroupId(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">          
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              My Mailing Groups
            </h2>
            <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></span>
              Manage personal recipient groups
            </p>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Create Group
          </button>
        )}
      </div>

      {/* New Group Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-6 animate-in slide-in-from-top-2 duration-300 shadow-sm relative overflow-hidden group/form">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] group-hover/form:scale-110 transition-transform duration-700 pointer-events-none">
            <Plus className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingGroupId ? 'Edit Mailing Group' : 'Create New Group'}
              </h3>
            </div>
            <button onClick={() => setIsAdding(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400"><X className="w-4 h-4"/></button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Group Name
                </label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Photo 1 Part, Align Analysis Team..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Search & Add Members
                </label>
                <div className="p-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <EmployeeSearch onSelect={handleAddMember} className="w-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Selected Members ({newGroupMembers.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md min-h-[140px] max-h-[300px] overflow-y-auto content-start shadow-inner">
                {newGroupMembers.length > 0 ? (
                  newGroupMembers.map(m => (
                    <div key={m.userId} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-2.5 py-1.5 rounded-sm shadow-sm group animate-in zoom-in-95">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">{m.fullName}</span>
                        <span className="text-[8px] font-bold text-slate-400 leading-none">{m.departmentName}</span>
                      </div>
                      <button onClick={() => handleRemoveMember(m.userId!)} className="p-0.5 text-slate-300 hover:text-red-500 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 py-10 opacity-50">
                    <User className="w-6 h-6 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No members added</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveGroup}
              disabled={!newGroupName.trim() || newGroupMembers.length === 0}
              className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" /> {editingGroupId ? 'Update Group' : 'Save Group'}
            </button>
          </div>
        </div>
      )}

      {/* Group List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-md border border-slate-200/60 dark:border-slate-800" />)
        ) : groups.length > 0 ? (
          groups.map((group: any) => (
            <div key={group.id} className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-4 hover:shadow-xl dark:hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all group/card flex flex-col h-full shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 group-hover/card:bg-indigo-600 transition-colors duration-500">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover/card:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tighter">{group.groupName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{group.members.length} Members</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(group)}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-all"
                    title="Edit Group"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => deleteGroup(group.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                    title="Delete Group"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar content-start">
                  {group.members.map((m: any) => (
                    <span key={m.userId} className="text-[8px] font-black bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {m.fullName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-tighter">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/30"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-slate-900/10">
            <Users className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">등록된 메일링 그룹이 없습니다.</p>
            <p className="text-[9px] text-slate-300 mt-1 italic">자주 사용하는 수신처를 그룹으로 등록해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
