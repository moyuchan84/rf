import React from 'react';
import { Zap, ShieldCheck, Layers } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsGridProps {
  stats: {
    requestsThisMonth: number;
    keyDesignsThisMonth: number;
    totalPhotoKeysThisMonth: number;
    photoKeysByPlan: Array<{ planId: number; designRule: string; count: number }>;
  };
  loading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading }) => {
  const statItems = [
    { 
      label: 'Monthly Requests', 
      value: stats.requestsThisMonth, 
      icon: Zap, 
      color: 'text-blue-600 dark:text-blue-400', 
      shadow: 'shadow-blue-500/5 dark:shadow-blue-500/10' 
    },
    { 
      label: 'New Key Designs', 
      value: stats.keyDesignsThisMonth, 
      icon: Layers, 
      color: 'text-amber-600 dark:text-amber-400', 
      shadow: 'shadow-amber-500/5 dark:shadow-amber-500/10' 
    },
    { 
      label: 'Processed PhotoKeys', 
      value: stats.totalPhotoKeysThisMonth, 
      icon: ShieldCheck, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      shadow: 'shadow-emerald-500/5 dark:shadow-emerald-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {statItems.map((stat) => (
        <div key={stat.label} className={clsx(
          "bg-white dark:bg-slate-900/50 p-6 rounded-md border border-slate-200/60 dark:border-slate-800 shadow-sm dark:shadow-lg",
          stat.shadow,
          "relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300",
          loading && "animate-pulse"
        )}>
          <div className="absolute top-0 right-0 p-3 opacity-[0.05] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <stat.icon className="w-16 h-16 text-slate-900 dark:text-white" />
          </div>
          
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors">
            {stat.label}
          </div>
          
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">
              {loading ? '---' : stat.value.toLocaleString()}
            </div>
            <div className={clsx("text-[8px] font-bold", stat.color)}>LAST 30D</div>
          </div>

          {stat.label === 'Processed PhotoKeys' && !loading && (
             <div className="mt-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  {stats.photoKeysByPlan.map(plan => (
                    <div key={plan.planId} className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-500 uppercase font-bold">{plan.designRule}</span>
                      <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{plan.count}</span>
                    </div>
                  ))}
                </div>
             </div>
          )}

          <div className="h-1 w-10 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden transition-colors">
            <div className="h-full w-2/3 rounded-full bg-indigo-500"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
