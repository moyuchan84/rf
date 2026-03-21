import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { UserManagementTable } from '@/features/auth/components/UserManagementTable';

export const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            User Management
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Manage system users and their access levels
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">
            Admin Access Only
          </span>
        </div>
      </div>

      <UserManagementTable />

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-md flex gap-4">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <h4 className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-widest">Important Note</h4>
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 mt-1">
            Changing a user's role will immediately update their access permissions. Users may need to refresh their session or re-login for some changes to take full effect across all components.
          </p>
        </div>
      </div>
    </div>
  );
};
