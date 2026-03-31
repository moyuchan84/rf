import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { LayoutDesignerPage } from '@/features/layout-designer/pages/LayoutDesignerPage';
import LayoutList from '@/features/layout-designer/components/LayoutList';
import { useLayoutStore } from '@/features/layout-designer/store/useLayoutStore';
import { useMasterData } from '@/features/master-data/hooks/useMasterData';
import { cn } from '@/shared/utils/cn';

const KeyLayoutPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'designer'>('list');
  const { loadLayout, reset } = useLayoutStore();
  const { processPlans } = useMasterData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [processPlanId, setProcessPlanId] = useState<number | null>(null);
  const [beolOptionId, setBeolOptionId] = useState<number | null>(null);
  const [productId, setSelectedProductId] = useState<number | null>(null);

  const selectedPlan = processPlans.find(p => p.id === processPlanId);
  const availableOptions = selectedPlan?.beolOptions || [];
  const selectedOption = availableOptions.find(o => o.id === beolOptionId);
  const availableProducts = selectedOption?.products || [];

  const handleCreate = () => {
    reset(); // Clear store for new layout
    setView('designer');
  };

  const handleEdit = (layout: any) => {
    loadLayout(layout);
    setView('designer');
  };

  const handleBack = () => {
    setView('list');
    reset();
  };

  if (view === 'designer') {
    return <LayoutDesignerPage onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors uppercase tracking-tighter">키레이아웃 관리</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Reticle Shot & Chip Placement Management</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          NEW LAYOUT
        </button>
      </div>

      <div className="space-y-3 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl transition-all">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search layouts by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 pl-12 pr-5 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-md outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-5 py-3 border rounded-md transition-all flex items-center gap-2.5 active:scale-95 shadow-sm",
              showFilters || productId
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Hierarchy Filter</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1 tracking-widest text-indigo-500">1. Process Plan</label>
              <select 
                value={processPlanId || ''}
                onChange={(e) => {
                  setProcessPlanId(Number(e.target.value) || null);
                  setBeolOptionId(null);
                  setSelectedProductId(null);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">ALL PLANS</option>
                {processPlans.map(p => (
                  <option key={p.id} value={p.id}>{p.designRule}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1 tracking-widest text-indigo-500">2. BEOL Option</label>
              <select 
                value={beolOptionId || ''}
                onChange={(e) => {
                  setBeolOptionId(Number(e.target.value) || null);
                  setSelectedProductId(null);
                }}
                disabled={!processPlanId}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">ALL OPTIONS</option>
                {availableOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.optionName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1 tracking-widest text-indigo-500">3. Product</label>
              <select 
                value={productId || ''}
                onChange={(e) => setSelectedProductId(Number(e.target.value) || null)}
                disabled={!beolOptionId}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">SELECT PRODUCT</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.productName} ({p.partId})</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {productId ? (
        <LayoutList productId={productId} onEdit={handleEdit} onCreate={handleCreate} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-60">
          <Filter className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Select a product to view reticle layouts</p>
        </div>
      )}
    </div>
  );
};

export default KeyLayoutPage;
