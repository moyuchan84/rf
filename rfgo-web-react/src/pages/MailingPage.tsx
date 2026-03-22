// rfgo-web-react/src/pages/MailingPage.tsx
import React from 'react';
import { MailGroupManager } from '../features/mailing/components/MailGroupManager';
import { Mail, ShieldCheck } from 'lucide-react';

const MailingPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-md shadow-lg shadow-indigo-600/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Mailing Settings
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-indigo-500" /> Personal & System Mailing Management
          </p>
        </div>
      </div>

      <div className="w-full">
        <MailGroupManager />
      </div>
    </div>
  );
};

export default MailingPage;
