import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import { useDashboardStore } from './store/useDashboardStore';
import { StatsGrid } from './components/StatsGrid';
import { RecentRequests } from './components/RecentRequests';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const Dashboard: React.FC = () => {
  const { stats, recentRequests, loading, handleRefresh } = useDashboard();
  const { lastRefreshedAt } = useDashboardStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">
            System Overview
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2 transition-colors">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            Real-time infrastructure analytics
            {lastRefreshedAt && (
              <span className="ml-2 text-slate-400 dark:text-slate-600 font-medium tracking-normal capitalize">
                • Updated at {format(lastRefreshedAt, 'HH:mm:ss')}
              </span>
            )}
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className={clsx(
            "p-2 rounded-md border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900",
            "text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400",
            "hover:border-indigo-500/50 transition-all active:scale-95 shadow-sm",
            loading && "opacity-50 cursor-not-allowed"
          )}
          title="Refresh Dashboard"
        >
          <RefreshCcw className={clsx("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>
      
      {/* Stats Section */}
      <StatsGrid stats={stats} loading={loading} />

      {/* Main Content Section */}
      <div className="grid grid-cols-1 gap-6">
        <RecentRequests requests={recentRequests} loading={loading} />
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center px-2">
        <div className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          RFGO Infrastructure v1.2.0
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">API Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">DB Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
