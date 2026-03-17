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
  return (
    <article 
      onClick={() => onClick(request)}
      className="group bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 rounded-[2.5rem] p-8 transition-all hover:bg-slate-900 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)] cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-6">
          <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors group-hover:border-indigo-500 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            <FileText className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-500/20">#REQ-{request.id}</span>
              <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/20">{request.requestType}</span>
              <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-700/50 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{request.title}</h3>
            <div className="flex items-center gap-6 mt-4 text-slate-500">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-400/50" />
                <span className="text-[10px] font-bold">{request.requesterId}</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400/50" />
                <span className="text-[10px] font-bold">{request.edmList.length} Links</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-indigo-400/50" />
                <span className="text-[10px] font-bold">{request.pkdVersions.length} PDK</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => onEdit(e, request)}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => onDelete(e, request.id)}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-600 hover:text-red-400 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-4 rounded-full bg-slate-950 border border-slate-800 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">
            <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </div>
    </article>
  );
};
