import React from 'react';
import { Layers, Edit3, Trash2, Calendar, Clock, Eye } from 'lucide-react';

interface LayoutCardProps {
  layout: any;
  onView: () => void;
  onEdit: (layout: any) => void;
  onDelete: (id: number) => void;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ layout, onView, onEdit, onDelete }) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    if (layout.imageUrl) {
      console.log(`Layout ID ${layout.id} has imageUrl of length: ${layout.imageUrl.length}`);
    } else {
      console.log(`Layout ID ${layout.id} has NO imageUrl`);
    }
  }, [layout.id, layout.imageUrl]);

  return (
    <article 
      onClick={onView}
      className="group bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-md p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm dark:shadow-lg hover:shadow-md cursor-pointer relative overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/[0.02] dark:bg-indigo-600/[0.04] blur-3xl rounded-full pointer-events-none"></div>
      
      {/* Thumbnail Area */}
      <div className="relative h-32 mb-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 group-hover:border-indigo-500/30 transition-colors">
        {layout.imageUrl && !imgError ? (
          <img 
            src={layout.imageUrl} 
            alt={layout.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-800 group-hover:text-indigo-500 transition-colors">
            <Layers className="w-8 h-8" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-4px] group-hover:translate-y-0 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(layout); }}
            title="Edit Layout"
            className="p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all shadow-lg"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(layout.id); }}
            title="Delete Layout"
            className="p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:text-red-600 hover:scale-110 transition-all shadow-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating ID Tag */}
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-sm bg-slate-900/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/10 text-[7px] font-black text-white/90 uppercase tracking-widest z-10">
          ID-{layout.id}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          {layout.config?.strategy && (
            <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-emerald-500/20">{layout.config.strategy}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate mb-1 flex-1">{layout.title}</h3>
          <Eye className="w-3 h-3 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
        
        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Created</span>
            <span className="text-slate-600 dark:text-slate-300">{new Date(layout.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Updated</span>
            <span className="text-slate-600 dark:text-slate-300">{new Date(layout.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default LayoutCard;
