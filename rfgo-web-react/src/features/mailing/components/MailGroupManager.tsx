// rfgo-web-react/src/features/mailing/components/MailGroupManager.tsx
import React, { useState } from 'react';
import { useMailingGroups } from '../hooks/useMailingGroups';
import { EmployeeSearch } from '../../employee/components/EmployeeSearch';
import { EmployeeDto, UserMailGroup } from '../store/useMailSelectorStore';
import { Plus, Trash2, Users, User, X, Save, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> 내 메일링 그룹 관리
        </h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-sm text-[10px] font-black uppercase transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> 그룹 생성
          </button>
        )}
      </div>

      {/* New Group Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-sm p-8 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-indigo-500/5 relative min-h-[500px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Create New Mailing Group</h3>
            </div>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full"></div> Group Name
                </label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Photo 1 Part, Align Analysis Team..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full"></div> Add Members
                </label>
                <EmployeeSearch onSelect={handleAddMember} className="w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-500 rounded-full"></div> Selected Members ({newGroupMembers.length})
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm min-h-[140px] max-h-[300px] overflow-y-auto content-start shadow-inner">
                {newGroupMembers.length > 0 ? (
                  newGroupMembers.map(m => (
                    <div key={m.userId} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-sm shadow-sm group animate-in zoom-in-95">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">{m.fullName}</span>
                        <span className="text-[8px] font-bold text-slate-400 leading-none">{m.departmentName}</span>
                      </div>
                      <button onClick={() => handleRemoveMember(m.userId!)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-50">
                    <User className="w-8 h-8 mb-2 stroke-[1]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No members added</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-2.5 text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveGroup}
              disabled={!newGroupName.trim() || newGroupMembers.length === 0}
              className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale text-white px-8 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" /> {editingGroupId ? 'Update Group' : 'Save Group'}
            </button>
          </div>
        </div>
      )}

      {/* Group List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-sm border border-slate-200 dark:border-slate-800" />)
        ) : groups.length > 0 ? (
          groups.map((group: any) => (
            <div key={group.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm p-5 hover:shadow-xl hover:border-indigo-500/30 transition-all group/card flex flex-col h-full shadow-sm relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 group-hover/card:bg-indigo-600 transition-colors duration-500">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover/card:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight truncate uppercase tracking-tighter">{group.groupName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{group.members.length} Members</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(group)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-sm transition-all"
                    title="Edit Group"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => deleteGroup(group.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-all"
                    title="Delete Group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                  {group.members.map((m: any) => (
                    <span key={m.userId} className="text-[9px] font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {m.fullName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50/30 dark:bg-slate-900/10">
            <Users className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-2" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">등록된 메일링 그룹이 없습니다.</p>
            <p className="text-[10px] text-slate-300 mt-1 italic">자주 사용하는 수신처를 그룹으로 등록해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
