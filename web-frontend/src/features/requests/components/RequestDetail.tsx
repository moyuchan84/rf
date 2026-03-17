import React from 'react';
import { 
  Info, 
  ExternalLink, 
  Globe, 
  Settings, 
  User, 
  Hash, 
  Clock, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { type RequestItem } from '../../master-data/types';

interface RequestDetailProps {
  request: RequestItem;
  onEdit: (req: RequestItem) => void;
  onDelete: (id: number) => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({ 
  request, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-500/20">#REQ-{request.id}</span>
              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-500/20">{request.requestType}</span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{request.title}</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onEdit(request)}
              className="p-4 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-700/50 shadow-xl"
            >
              <Edit3 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => onDelete(request.id)}
              className="p-4 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-700/50 shadow-xl"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Info className="w-4 h-4" /> Description & Requirements
              </h3>
              <div 
                className="bg-slate-950/50 border border-slate-800 p-8 rounded-[2rem] text-slate-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: request.description }}
              />
            </section>

            <div className="grid grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> EDM Links
                </h3>
                <div className="space-y-2">
                  {request.edmList.map((link, i) => (
                    <a 
                      key={i} 
                      href={link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{link}</span>
                      <Globe className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Settings className="w-4 h-4" /> PDK Versions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {request.pkdVersions.map((v, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-200">
                      {v}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Metadata</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                    <User className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Requester</p>
                    <p className="text-sm font-black text-white">{request.requesterId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                    <Hash className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Product ID</p>
                    <p className="text-sm font-black text-white">{request.productId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Created At</p>
                    <p className="text-sm font-black text-white">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
