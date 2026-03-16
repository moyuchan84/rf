import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">System Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: '128', color: 'bg-blue-500' },
          { label: 'Pending Approvals', value: '14', color: 'bg-amber-500' },
          { label: 'Processed Keys', value: '2,450', color: 'bg-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            <div className={`h-1 w-12 ${stat.color} rounded-full mt-4`}></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Recent Activity</h3>
        </div>
        <div className="p-12 text-center text-slate-400 font-bold italic text-sm">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
