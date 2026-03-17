import React, { useState } from 'react';
import type { SelectedNode } from '../types';
import { ChevronRight, ChevronDown, FolderTree, FileSpreadsheet, Box } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useMasterData } from '../hooks/useMasterData';

const HierarchyExplorer: React.FC = () => {
  const { processPlans, selectedNode, setSelectedNode, setIsFormOpen } = useMasterData();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateChild = (type: SelectedNode['type'], parentData: any, path: string[]) => {
    setSelectedNode({ type, id: -1, data: { parentId: parentData.id }, path });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-2">
      {processPlans.map((pp) => (
        <div key={pp.id} className="space-y-1">
          <div
            className={cn(
              'group flex items-center gap-2 p-2.5 rounded-md cursor-pointer transition-all border border-transparent shadow-sm',
              selectedNode?.type === 'plan' && selectedNode?.id === pp.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-indigo-500/50'
                : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800/0 hover:border-slate-300 dark:hover:border-slate-800'
            )}
            onClick={() => setSelectedNode({ type: 'plan', id: pp.id, data: pp, path: [pp.designRule] })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(`plan-${pp.id}`);
              }}
              className={cn(
                "rounded-md p-1 transition-colors",
                selectedNode?.type === 'plan' && selectedNode?.id === pp.id ? "hover:bg-white/20" : "hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {expandedNodes[`plan-${pp.id}`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <FolderTree className={cn("w-4 h-4 transition-colors", selectedNode?.type === 'plan' && selectedNode?.id === pp.id ? "text-white" : "text-indigo-500 dark:text-indigo-400")} />
            <span className="text-xs font-black truncate flex-1 uppercase tracking-wider transition-colors">{pp.designRule}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateChild('option', pp, [pp.designRule]);
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-base font-light transition-all active:scale-90 shadow-md",
                selectedNode?.type === 'plan' && selectedNode?.id === pp.id 
                  ? "bg-white text-indigo-600" 
                  : "bg-indigo-600 text-white shadow-indigo-600/20"
              )}
            >
              +
            </button>
          </div>

          {expandedNodes[`plan-${pp.id}`] && (
            <div className="ml-5 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1.5 py-1.5 transition-colors">
              {pp.beolOptions.map((bo) => (
                <div key={bo.id} className="space-y-1">
                  <div
                    className={cn(
                      'group flex items-center gap-2 p-2.5 rounded-md cursor-pointer transition-all border border-transparent shadow-sm',
                      selectedNode?.type === 'option' && selectedNode?.id === bo.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-slate-300 border-slate-200 dark:border-slate-800/0 hover:border-slate-300 dark:hover:border-slate-800'
                    )}
                    onClick={() => setSelectedNode({ type: 'option', id: bo.id, data: bo, path: [pp.designRule, bo.optionName] })}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(`option-${bo.id}`);
                      }}
                      className={cn(
                        "rounded-md p-1 transition-colors",
                        selectedNode?.type === 'option' && selectedNode?.id === bo.id ? "hover:bg-white/20" : "hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {expandedNodes[`option-${bo.id}`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <FileSpreadsheet className={cn("w-3.5 h-3.5 transition-colors", selectedNode?.type === 'option' && selectedNode?.id === bo.id ? "text-white" : "text-blue-500 dark:text-blue-500/50")} />
                    <span className="text-[10px] font-black truncate flex-1 uppercase tracking-widest transition-colors">{bo.optionName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateChild('product', bo, [pp.designRule, bo.optionName]);
                      }}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-xs font-light shadow-md active:scale-90 transition-all",
                        selectedNode?.type === 'option' && selectedNode?.id === bo.id 
                          ? "bg-white text-blue-600" 
                          : "bg-blue-600 text-white shadow-blue-600/20"
                      )}
                    >
                      +
                    </button>
                  </div>

                  {expandedNodes[`option-${bo.id}`] && (
                    <div className="ml-4 pl-4 border-l border-slate-200 dark:border-blue-900/30 space-y-1 py-1 transition-colors">
                      {bo.products.map((prod) => (
                        <div
                          key={prod.id}
                          className={cn(
                            'group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border border-transparent shadow-sm',
                            selectedNode?.type === 'product' && selectedNode?.id === prod.id
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border-emerald-500/30'
                              : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-slate-400 border-slate-200 dark:border-slate-800/0 hover:border-slate-300 dark:hover:border-slate-800'
                          )}
                          onClick={() => setSelectedNode({ type: 'product', id: prod.id, data: prod, path: [pp.designRule, bo.optionName, prod.partId] })}
                        >
                          <Box className={cn("w-3.5 h-3.5 transition-colors", selectedNode?.type === 'product' && selectedNode?.id === prod.id ? "text-white" : "text-emerald-500 dark:text-emerald-500/30")} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] transition-colors">{prod.partId}</div>
                            <div className="text-[8px] font-bold opacity-60 truncate uppercase transition-opacity">{prod.productName}</div>
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
  );
};

export default HierarchyExplorer;
