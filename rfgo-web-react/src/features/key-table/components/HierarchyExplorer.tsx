import React, { useState, useMemo } from 'react';
import { Database, RefreshCw, ChevronRight, CheckCircle, Search, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { ProcessPlan, BeolOption, Product } from '../../master-data/types';
import { useKeyTableStore } from '../store/useKeyTableStore';

interface HierarchyExplorerProps {
  hierarchy: ProcessPlan[];
  loading: boolean;
  onRefresh: () => void;
}

export const HierarchyExplorer: React.FC<HierarchyExplorerProps> = ({
  hierarchy,
  loading,
  onRefresh,
}) => {
  const { 
    selectedPlanId, setSelectedPlanId,
    selectedOptionId, setSelectedOptionId,
    selectedProductId, setSelectedProductId
  } = useKeyTableStore();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm.trim()) return hierarchy;
    const term = searchTerm.toLowerCase();

    return hierarchy.map((plan: ProcessPlan) => {
      const planMatches = plan.designRule.toLowerCase().includes(term);
      
      const filteredOptions = plan.beolOptions.map((option: BeolOption) => {
        const optionMatches = option.optionName.toLowerCase().includes(term);
        
        const filteredProducts = option.products.filter((prod: Product) => 
          prod.partId.toLowerCase().includes(term) || 
          prod.productName.toLowerCase().includes(term)
        );

        if (optionMatches || filteredProducts.length > 0) {
          return { ...option, products: filteredProducts };
        }
        return null;
      }).filter(Boolean);

      if (planMatches || filteredOptions.length > 0) {
        return { ...plan, beolOptions: filteredOptions as any };
      }
      return null;
    }).filter(Boolean) as ProcessPlan[];
  }, [hierarchy, searchTerm]);

  return (
    <aside className="w-80 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col overflow-hidden shrink-0 shadow-sm dark:shadow-2xl transition-all">
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest transition-colors">Hierarchy Explorer</span>
        </div>
        <button 
          onClick={() => {
            onRefresh();
          }} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400 dark:text-slate-500", loading && "animate-spin")} />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans, options, products..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-8 pr-8 text-[10px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {filteredHierarchy.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <Search className="w-8 h-8 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">No matches found</span>
          </div>
        ) : (
          filteredHierarchy.map(plan => (
            <div key={plan.id} className="space-y-1">
              <div 
                onClick={() => setSelectedPlanId(plan.id === selectedPlanId ? null : plan.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                  selectedPlanId === plan.id || searchTerm ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                )}
              >
                <ChevronRight className={cn("w-3 h-3 transition-transform", (selectedPlanId === plan.id || searchTerm) && "rotate-90")} />
                <span className="text-xs font-black uppercase tracking-tighter transition-colors">{plan.designRule}</span>
              </div>

              {(selectedPlanId === plan.id || searchTerm) && (
                <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1 animate-in slide-in-from-top-1 duration-200 transition-colors">
                  {plan.beolOptions.map(option => (
                    <div key={option.id} className="space-y-1">
                      <div 
                        onClick={() => setSelectedOptionId(option.id === selectedOptionId ? null : option.id)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border border-transparent",
                          selectedOptionId === option.id || searchTerm ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500"
                        )}
                      >
                        <ChevronRight className={cn("w-2.5 h-2.5 transition-transform", (selectedOptionId === option.id || searchTerm) && "rotate-90")} />
                        <span className="text-[11px] font-bold uppercase transition-colors">{option.optionName}</span>
                      </div>

                      {(selectedOptionId === option.id || searchTerm) && (
                        <div className="ml-4 space-y-1">
                          {option.products.map(prod => (
                            <div 
                              key={prod.id}
                              onClick={() => setSelectedProductId(prod.id)}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border border-transparent",
                                selectedProductId === prod.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-600"
                              )}
                            >
                              <CheckCircle className={cn("w-3 h-3", selectedProductId === prod.id ? "text-white" : "text-slate-300 dark:text-slate-800")} />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase truncate transition-colors">{prod.partId}</p>
                                <p className="text-[8px] font-bold opacity-50 truncate transition-opacity">{prod.productName}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

