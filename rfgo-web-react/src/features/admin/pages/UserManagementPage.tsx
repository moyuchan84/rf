import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { UserManagementTable } from '../components/UserManagementTable';

export const UserManagementPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            User Management
          </h1>
          <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></span>
            Manage system users and their access levels
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 px-3 py-2 rounded-md border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 shadow-sm">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">
            Admin Access Only
          </span>
        </div>
      </div>

      <UserManagementTable />

      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-900/30 p-4 rounded-md flex gap-4 shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <h4 className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-widest">Important Note</h4>
          <p className="text-[10px] font-bold text-amber-700/80 dark:text-amber-500/80 mt-1 leading-relaxed uppercase tracking-tight">
            Changing a user's role will immediately update their access permissions. Users may need to refresh their session or re-login for some changes to take full effect across all components.
          </p>
        </div>
      </div>
    </div>
  );
};
