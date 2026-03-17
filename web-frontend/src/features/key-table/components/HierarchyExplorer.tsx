import React from 'react';
import { Database, RefreshCw, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { ProcessPlan } from '../../master-data/types';
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

  return (
    <aside className="w-80 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shrink-0 shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hierarchy Explorer</span>
        </div>
        <button onClick={onRefresh} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
          <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", loading && "animate-spin")} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {hierarchy.map(plan => (
          <div key={plan.id} className="space-y-1">
            <div 
              onClick={() => setSelectedPlanId(plan.id === selectedPlanId ? null : plan.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                selectedPlanId === plan.id ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "hover:bg-slate-800/50 text-slate-400"
              )}
            >
              <ChevronRight className={cn("w-3 h-3 transition-transform", selectedPlanId === plan.id && "rotate-90")} />
              <span className="text-xs font-black uppercase tracking-tighter">{plan.designRule}</span>
            </div>

            {selectedPlanId === plan.id && (
              <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 animate-in slide-in-from-top-1 duration-200">
                {plan.beolOptions.map(option => (
                  <div key={option.id} className="space-y-1">
                    <div 
                      onClick={() => setSelectedOptionId(option.id === selectedOptionId ? null : option.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border border-transparent",
                        selectedOptionId === option.id ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400" : "hover:bg-slate-800/50 text-slate-500"
                      )}
                    >
                      <ChevronRight className={cn("w-2.5 h-2.5 transition-transform", selectedOptionId === option.id && "rotate-90")} />
                      <span className="text-[11px] font-bold uppercase">{option.optionName}</span>
                    </div>

                    {selectedOptionId === option.id && (
                      <div className="ml-4 space-y-1">
                        {option.products.map(prod => (
                          <div 
                            key={prod.id}
                            onClick={() => setSelectedProductId(prod.id)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border border-transparent",
                              selectedProductId === prod.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "hover:bg-slate-800/50 text-slate-600"
                            )}
                          >
                            <CheckCircle className={cn("w-3 h-3", selectedProductId === prod.id ? "text-white" : "text-slate-800")} />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase truncate">{prod.partId}</p>
                              <p className="text-[8px] font-bold opacity-50 truncate">{prod.productName}</p>
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
        ))}
      </div>
    </aside>
  );
};
