import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  ExternalLink, 
  Settings, 
  ArrowRight, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { type RequestItem } from '../../master-data/types';
import { REQUEST_TYPE_LABELS, RequestType } from '../types';
import { useUserStore } from '../../auth/store/useUserStore';
import { PermissionGate } from '../../auth/components/PermissionGate';

interface RequestItemCardProps {
  request: RequestItem;
  onClick: (req: RequestItem) => void;
  onEdit: (e: React.MouseEvent, req: RequestItem) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

export const RequestItemCard: React.FC<RequestItemCardProps> = ({ 
  request, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const user = useUserStore((state) => state.user);
  
  // Author check: updater == user.id (as requested) or requesterId == user.userId
  const isAuthor = (request as any).updater === user?.id || request.requesterId === user?.userId;

  const actionButtons = (
    <>
      <button 
        onClick={(e) => onEdit(e, request)}
        className="p-1.5 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm opacity-0 group-hover:opacity-100"
      >
        <Edit3 className="w-3 h-3" />
      </button>
      <button 
        onClick={(e) => onDelete(e, request.id)}
        className="p-1.5 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </>
  );

  return (
    <article 
      onClick={() => onClick(request)}
      className="group bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-md p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="w-9 h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <FileText className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-white transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[7px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-indigo-500/20">#REQ-{request.id}</span>
              <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-500/20">
                {REQUEST_TYPE_LABELS[request.requestType as RequestType] || request.requestType}
              </span>
              <span className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-slate-200 dark:border-slate-700/50 flex items-center gap-1 transition-colors">
                <Calendar className="w-2 h-2" /> {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{request.title}</h3>
            <div className="flex items-center gap-3 mt-2.5 text-slate-400 dark:text-slate-500 transition-colors">
              <div className="flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400/50" />
                <span className="text-[7px] font-bold uppercase">{request.requesterId}</span>
              </div>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400/50" />
                <span className="text-[7px] font-bold uppercase">{request.edmList.length} Links</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400/50" />
                <span className="text-[7px] font-bold uppercase">{request.pkdVersions.length} PDK</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PermissionGate allowedRoles={['ADMIN']} fallback={isAuthor ? actionButtons : null}>
            {actionButtons}
          </PermissionGate>
          <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all shadow-sm">
            <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </div>
    </article>
  );
};
