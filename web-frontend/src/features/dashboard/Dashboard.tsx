import React from 'react';
import { Activity, Zap, Clock, ShieldCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">System Overview</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2 transition-colors">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Real-time infrastructure analytics
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: '128', icon: Zap, color: 'text-blue-600 dark:text-blue-400', shadow: 'shadow-blue-500/5 dark:shadow-blue-500/10' },
          { label: 'Pending Approvals', value: '14', icon: Clock, color: 'text-amber-600 dark:text-amber-400', shadow: 'shadow-amber-500/5 dark:shadow-amber-500/10' },
          { label: 'Processed Keys', value: '2,450', icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/5 dark:shadow-emerald-500/10' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm dark:shadow-xl ${stat.shadow} relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all`}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <stat.icon className="w-20 h-20 text-slate-900 dark:text-white" />
            </div>
            <div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 transition-colors">{stat.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">{stat.value}</div>
              <div className={`text-[10px] font-bold ${stat.color}`}>+12%</div>
            </div>
            <div className={`h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden transition-colors`}>
              <div className={`h-full w-2/3 rounded-full bg-indigo-500`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm dark:shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden relative transition-all">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
        <div className="p-8 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 relative z-10 transition-colors">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Recent Activity Stream</h3>
          </div>
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800 transition-colors shadow-sm">Live Feed</span>
        </div>
        <div className="p-20 text-center relative z-10">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-200/60 dark:border-slate-800 shadow-sm mx-auto transition-all">
            <Activity className="text-slate-300 dark:text-slate-800 w-10 h-10 transition-colors" />
          </div>
          <h4 className="text-sm font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.3em] mb-2 transition-colors">No activity detected</h4>
          <p className="text-xs text-slate-500 dark:text-slate-600 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-widest transition-colors">
            System logs are currently clear. New activities will appear here in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
