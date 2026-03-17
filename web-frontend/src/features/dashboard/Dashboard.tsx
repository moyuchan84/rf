import React from 'react';
import { Activity, Zap, Clock, ShieldCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">System Overview</h2>
          <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2 transition-colors">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            Real-time infrastructure analytics
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Total Requests', value: '128', icon: Zap, color: 'text-blue-600 dark:text-blue-400', shadow: 'shadow-blue-500/5 dark:shadow-blue-500/10' },
          { label: 'Pending Approvals', value: '14', icon: Clock, color: 'text-amber-600 dark:text-amber-400', shadow: 'shadow-amber-500/5 dark:shadow-amber-500/10' },
          { label: 'Processed Keys', value: '2,450', icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/5 dark:shadow-emerald-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white dark:bg-slate-900/50 p-6 rounded-md border border-slate-200/60 dark:border-slate-800 shadow-sm dark:shadow-lg ${stat.shadow} relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all`}>
            <div className="absolute top-0 right-0 p-3 opacity-[0.05] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <stat.icon className="w-16 h-16 text-slate-900 dark:text-white" />
            </div>
            <div className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 transition-colors">{stat.label}</div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">{stat.value}</div>
              <div className={`text-[8px] font-bold ${stat.color}`}>+12%</div>
            </div>
            <div className={`h-1 w-10 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden transition-colors`}>
              <div className={`h-full w-2/3 rounded-full bg-indigo-500`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-md shadow-sm dark:shadow-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden relative transition-all">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 relative z-10 transition-colors">
          <div className="flex items-center gap-2.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Recent Activity Stream</h3>
          </div>
          <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase px-2.5 py-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200/60 dark:border-slate-800 transition-colors shadow-sm">Live Feed</span>
        </div>
        <div className="p-16 text-center relative z-10">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-md flex items-center justify-center mb-5 border border-slate-200/60 dark:border-slate-800 shadow-sm mx-auto transition-all">
            <Activity className="text-slate-300 dark:text-slate-800 w-8 h-8 transition-colors" />
          </div>
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.3em] mb-1.5 transition-colors">No activity detected</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-600 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-widest transition-colors">
            System logs are currently clear. New activities will appear here in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
