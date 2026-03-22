import React from 'react';
import { UserCog, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUserManagement } from '../hooks/useUserManagement';

export const UserManagementTable: React.FC = () => {
  const { 
    users, 
    roles, 
    isLoading, 
    updatingId, 
    handleRoleChange,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    totalPages,
    totalCount
  } = useUserManagement();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or Knox ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          Total: {totalCount} Users
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">User Info</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Department</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Current Role</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Users...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No users found</span>
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <UserCog className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">{user.fullName}</div>
                        <div className="text-[10px] font-bold text-slate-500">{user.userId} • {user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                      {user.deptName}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      user.role.name === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      user.role.name === 'RFG' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      user.role.name === 'INNO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {user.role.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <select
                        className="text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        value={user.role.id}
                        disabled={updatingId === user.id}
                        onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                      >
                        {roles.map((role: any) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      {updatingId === user.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="bg-slate-50/50 dark:bg-slate-950/30 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
            Page {page} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || isLoading}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
