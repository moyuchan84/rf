import React from 'react';
import { useLayouts } from '../hooks/useLayouts';
import LayoutCard from './LayoutCard';
import { Database, Plus } from 'lucide-react';

interface LayoutListProps {
  productId: number;
  onEdit: (layout: any) => void;
  onCreate: () => void;
}

const LayoutList: React.FC<LayoutListProps> = ({ productId, onEdit, onCreate }) => {
  const { layouts, loading, deleteLayout } = useLayouts(productId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  if (layouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl transition-all">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <Database className="w-10 h-10 text-slate-200 dark:text-slate-800" />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-[0.3em]">No Layouts Found</h3>
        <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest">Start by creating your first reticle layout</p>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Create Layout
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {layouts.map((layout: any) => (
        <LayoutCard 
          key={layout.id} 
          layout={layout} 
          onEdit={onEdit} 
          onDelete={deleteLayout}
        />
      ))}
    </div>
  );
};

export default LayoutList;
