import React from 'react';
import { Edit2, Trash2, ArrowUpRight, Layers, Palette } from 'lucide-react';
import { KeyDesign } from '../types';
import { useKeyDesignStore } from '../store/keyDesignStore';
import { useKeyDesign } from '../hooks/useKeyDesign';

interface KeyDesignCardProps {
  design: KeyDesign;
}

const KeyDesignCard: React.FC<KeyDesignCardProps> = ({ design }) => {
  const { openUpdateModal, openViewModal } = useKeyDesignStore();
  const { deleteKeyDesign } = useKeyDesign();

  const firstImage = design.images && design.images.length > 0 ? design.images[0] : null;

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group shadow-sm dark:shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
        <button
          onClick={() => openUpdateModal(design)}
          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => deleteKeyDesign(design.id)}
          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-lg mb-5 flex flex-col items-center justify-center border border-slate-200/60 dark:border-slate-800 group-hover:border-indigo-500/20 transition-all shadow-sm relative overflow-hidden">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={design.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <>
            <Palette className="w-12 h-12 text-slate-200 dark:text-slate-800 group-hover:text-indigo-600/20 dark:group-hover:text-indigo-500/10 transition-colors" />
            <div 
              className="absolute inset-4 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center"
              style={{ 
                transform: `rotate(${design.rotation}deg)`,
                aspectRatio: design.sizeX / design.sizeY || 1
              }}
            >
              <div className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">
                {design.sizeX} x {design.sizeY}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-xs transition-colors">
            {design.name}
          </h3>
          <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
            {design.keyType}
          </span>
        </div>
        <div 
          className="text-slate-500 dark:text-slate-500 text-[10px] font-bold line-clamp-2 min-h-[30px]"
          dangerouslySetInnerHTML={{ __html: design.description || 'No description provided' }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {design.processPlans?.map(plan => (
            <span key={plan.id} className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              {plan.designRule}
            </span>
          ))}
          {(!design.processPlans || design.processPlans.length === 0) && (
            <span className="text-[8px] font-black text-slate-300 italic uppercase">No linked plans</span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 uppercase font-black">Pitch X</span>
              <span className="text-[9px] text-slate-900 dark:text-slate-300 font-bold">
                {design.xAxis.w.pitch} / {design.xAxis.m.pitch}
              </span>
            </div>
            <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-2">
              <span className="text-[8px] text-slate-400 uppercase font-black">Pitch Y</span>
              <span className="text-[9px] text-slate-900 dark:text-slate-300 font-bold">
                {design.yAxis.w.pitch} / {design.yAxis.m.pitch}
              </span>
            </div>
          </div>
          <button 
            onClick={() => openViewModal(design)}
            className="text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            Details <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyDesignCard;
