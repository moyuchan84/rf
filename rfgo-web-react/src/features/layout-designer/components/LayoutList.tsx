import React, { useState } from 'react';
import { useLayouts } from '../hooks/useLayouts';
import LayoutCard from './LayoutCard';
import { Database, Plus, Loader2 } from 'lucide-react';
import { LayoutPreviewModal } from './LayoutPreviewModal';

interface LayoutListProps {
  productId?: number | null;
  search?: string;
  onEdit: (layout: any) => void;
  onCreate: () => void;
}

const LayoutList: React.FC<LayoutListProps> = ({ productId, search, onEdit, onCreate }) => {
  const { layouts, loading, deleteLayout, loadMore, hasMore } = useLayouts(productId, search);
  const [previewLayout, setPreviewLayout] = useState<any | null>(null);

  if (loading && layouts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest">
          {productId || search ? "Try changing your filters" : "Start by creating your first reticle layout"}
        </p>
        {!productId && !search && (
          <button 
            onClick={onCreate}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create Layout
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {layouts.map((layout: any) => (
            <LayoutCard 
              key={layout.id} 
              layout={layout} 
              onView={() => setPreviewLayout(layout)}
              onEdit={onEdit} 
              onDelete={deleteLayout}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Layouts"
              )}
            </button>
          </div>
        )}
      </div>

      {previewLayout && (
        <LayoutPreviewModal 
          layout={previewLayout} 
          onClose={() => setPreviewLayout(null)} 
          onEdit={(l) => {
            setPreviewLayout(null);
            onEdit(l);
          }}
        />
      )}
    </>
  );
};

export default LayoutList;
