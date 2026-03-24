import React, { useState } from 'react';
import { useApprovalPathStore } from '@/features/approval/store/useApprovalPathStore';
import { Trash2, User as UserIcon, ChevronUp, ChevronDown, Search, X, Users } from 'lucide-react';
import { EmployeeSearch } from '@/features/employee/components/EmployeeSearch';
import { ApprovalRole, APPROVAL_ROLE_LABELS } from '@/features/approval/types';

export const ApprovalLineTable: React.FC = () => {
  const { currentPath, removeApprover, updateRole, reorderPath, addApprover } = useApprovalPathStore();
  const [showSearch, setShowSearch] = useState(false);

  const handleRoleChange = (epId: string, role: string) => {
    updateRole(epId, role);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 1) return; // Drafter is at index 0 and shouldn't move, and first approver can't move up past drafter
    reorderPath(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === 0 || index === currentPath.length - 1) return; // Drafter doesn't move, last item can't move down
    reorderPath(index, index + 1);
  };

  const handleEmployeeSelect = (employee: any) => {
    addApprover(employee, '1'); // Default to '1' (Approve)
    // Keep search open for multiple additions, or close if preferred. 
    // User requested "search and add" like PathGroupForm.
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Path Structure ({currentPath.length})
        </h4>
        <button 
          onClick={() => setShowSearch(!showSearch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
            showSearch 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {showSearch ? <><X className="w-3 h-3" /> Close</> : <><Search className="w-3 h-3" /> Add Member</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Area */}
        {showSearch && (
          <div className="lg:col-span-5 space-y-2 animate-in slide-in-from-left-2 duration-300">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search & Add Members</label>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md p-1 h-[300px] overflow-hidden shadow-inner">
              <EmployeeSearch onSelect={handleEmployeeSelect} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Table/List Area */}
        <div className={`${showSearch ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="overflow-hidden border border-slate-200/60 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900/40 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800">
                  <th className="p-2 w-12 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Move</th>
                  <th className="p-2 w-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">No</th>
                  <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Approver / Dept</th>
                  <th className="p-2 text-[9px] font-black text-slate-400 uppercase tracking-widest w-10 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentPath.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-300 dark:text-slate-700 italic text-[10px] font-black uppercase tracking-[0.2em]">
                      No approval path defined
                    </td>
                  </tr>
                ) : (
                  currentPath.map((item, index) => {
                    const isDrafter = item.role === '0';
                    return (
                      <tr key={item.epId} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                        <td className="p-2 text-center">
                          {!isDrafter && (
                            <div className="flex flex-col items-center">
                              <button 
                                onClick={() => handleMoveUp(index)}
                                disabled={index <= 1}
                                className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0 transition-colors"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleMoveDown(index)}
                                disabled={index === currentPath.length - 1}
                                className="p-0.5 text-slate-300 hover:text-indigo-500 disabled:opacity-0 transition-colors"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">{index + 1}</span>
                        </td>
                        <td className="p-2">
                          <select
                            value={item.role}
                            disabled={isDrafter}
                            onChange={(e) => handleRoleChange(item.epId, e.target.value)}
                            className="text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm px-1.5 py-1 outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer disabled:cursor-default disabled:hover:border-transparent disabled:bg-transparent disabled:border-transparent"
                          >
                            {Object.values(ApprovalRole).map((role) => (
                              <option key={role} value={role}>
                                {APPROVAL_ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                              <div className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-tight uppercase tracking-tight">
                                {item.fullName} {isDrafter && <span className="ml-1 text-[8px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1 rounded-sm">DRFT</span>}
                              </div>
                              <div className="text-[8px] text-slate-400 dark:text-slate-500 leading-tight truncate max-w-[150px]">{item.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          {!isDrafter && (
                            <button
                              onClick={() => removeApprover(item.epId)}
                              className="p-1 rounded-sm text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
