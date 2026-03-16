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
    <div className="space-y-3">
      {processPlans.map((pp) => (
        <div key={pp.id} className="space-y-1">
          <div
            className={cn(
              'group flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border border-transparent',
              selectedNode?.type === 'plan' && selectedNode?.id === pp.id
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border-indigo-500/50'
                : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border-slate-800/0 hover:border-slate-800'
            )}
            onClick={() => setSelectedNode({ type: 'plan', id: pp.id, data: pp, path: [pp.designRule] })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(`plan-${pp.id}`);
              }}
              className={cn(
                "rounded-lg p-1 transition-colors",
                selectedNode?.type === 'plan' && selectedNode?.id === pp.id ? "hover:bg-white/20" : "hover:bg-slate-700"
              )}
            >
              {expandedNodes[`plan-${pp.id}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <FolderTree className={cn("w-5 h-5", selectedNode?.type === 'plan' && selectedNode?.id === pp.id ? "text-white" : "text-indigo-500")} />
            <span className="text-sm font-black truncate flex-1 uppercase tracking-wider">{pp.designRule}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateChild('option', pp, [pp.designRule]);
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl flex items-center justify-center text-lg font-light transition-all active:scale-90 shadow-xl",
                selectedNode?.type === 'plan' && selectedNode?.id === pp.id 
                  ? "bg-white text-indigo-600" 
                  : "bg-indigo-600 text-white shadow-indigo-600/20"
              )}
            >
              +
            </button>
          </div>

          {expandedNodes[`plan-${pp.id}`] && (
            <div className="ml-6 pl-5 border-l border-slate-800 space-y-2 py-2">
              {pp.beolOptions.map((bo) => (
                <div key={bo.id} className="space-y-1">
                  <div
                    className={cn(
                      'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent',
                      selectedNode?.type === 'option' && selectedNode?.id === bo.id
                        ? 'bg-blue-600/20 text-blue-400 shadow-xl border-blue-500/30'
                        : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 border-slate-800/0 hover:border-slate-800'
                    )}
                    onClick={() => setSelectedNode({ type: 'option', id: bo.id, data: bo, path: [pp.designRule, bo.optionName] })}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(`option-${bo.id}`);
                      }}
                      className="hover:bg-slate-700 rounded-lg p-1 transition-colors"
                    >
                      {expandedNodes[`option-${bo.id}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <FileSpreadsheet className={cn("w-4 h-4", selectedNode?.type === 'option' && selectedNode?.id === bo.id ? "text-blue-400" : "text-blue-500/50")} />
                    <span className="text-xs font-black truncate flex-1 uppercase tracking-widest">{bo.optionName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateChild('product', bo, [pp.designRule, bo.optionName]);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-light shadow-xl shadow-blue-600/20 active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  {expandedNodes[`option-${bo.id}`] && (
                    <div className="ml-5 pl-5 border-l border-blue-900/30 space-y-1 py-1">
                      {bo.products.map((prod) => (
                        <div
                          key={prod.id}
                          className={cn(
                            'group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border border-transparent',
                            selectedNode?.type === 'product' && selectedNode?.id === prod.id
                              ? 'bg-emerald-600/20 text-emerald-400 shadow-xl border-emerald-500/30'
                              : 'hover:bg-slate-800/50 text-slate-600 hover:text-slate-400 border-slate-800/0 hover:border-slate-800'
                          )}
                          onClick={() => setSelectedNode({ type: 'product', id: prod.id, data: prod, path: [pp.designRule, bo.optionName, prod.partId] })}
                        >
                          <Box className={cn("w-4 h-4", selectedNode?.type === 'product' && selectedNode?.id === prod.id ? "text-emerald-400" : "text-emerald-500/30")} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em]">{prod.partId}</div>
                            <div className="text-[9px] font-bold opacity-60 truncate uppercase">{prod.productName}</div>
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
