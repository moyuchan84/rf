import React from 'react';
import { Activity, Clock, User, Package } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

interface RequestItem {
  id: number;
  title: string;
  requestType: string;
  createdAt: string;
  requesterId: string;
  product?: {
    productName: string;
  };
}

interface RecentRequestsProps {
  requests: RequestItem[];
  loading?: boolean;
}

export const RecentRequests: React.FC<RecentRequestsProps> = ({ requests, loading }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: number) => {
    navigate(`/requests?id=${id}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-md shadow-sm dark:shadow-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden relative transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
      
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 relative z-10 transition-colors">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Recent Activity Stream</h3>
        </div>
        <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase px-2.5 py-1 bg-white dark:bg-slate-900 rounded-sm border border-slate-200/60 dark:border-slate-800 transition-colors shadow-sm">Live Feed</span>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-950/20">
            <tr>
              <th className="p-3 text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Request Type</th>
              <th className="p-3 text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Title</th>
              <th className="p-3 text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Product</th>
              <th className="p-3 text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Requester</th>
              <th className="p-3 text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr 
                  key={request.id} 
                  onClick={() => handleRowClick(request.id)}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                >
                  <td className="p-3">
                    <span className={clsx(
                      "px-2 py-0.5 text-[8px] font-black uppercase rounded-sm border",
                      request.requestType === 'SETUP' 
                        ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        : "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                    )}>
                      {request.requestType}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {request.title}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <Package className="w-3 h-3" />
                      {request.product?.productName || 'N/A'}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <User className="w-3 h-3" />
                      {request.requesterId}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-md flex items-center justify-center mb-5 border border-slate-200/60 dark:border-slate-800 shadow-sm mx-auto transition-all">
                    <Activity className="text-slate-300 dark:text-slate-800 w-6 h-6 transition-colors" />
                  </div>
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.3em] mb-1.5 transition-colors">No activity detected</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-600 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-widest transition-colors">
                    System logs are currently clear.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
