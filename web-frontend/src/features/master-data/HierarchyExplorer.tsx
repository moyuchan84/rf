import React, { useState } from 'react';
import type { ProcessPlan, SelectedNode, BeolOption, Product } from './types';
import { ChevronRight, ChevronDown, FolderTree, FileSpreadsheet, Box } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  data: ProcessPlan[];
  selectedNode: SelectedNode | null;
  onSelect: (node: SelectedNode) => void;
  onCreateChild: (type: SelectedNode['type'], parentData: any, path: string[]) => void;
}

const HierarchyExplorer: React.FC<Props> = ({ data, selectedNode, onSelect, onCreateChild }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-2">
      {data.map((pp) => (
        <div key={pp.id} className="space-y-1">
          <div
            className={cn(
              'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all',
              selectedNode?.type === 'plan' && selectedNode?.id === pp.id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                : 'hover:bg-slate-50 text-slate-600'
            )}
            onClick={() => onSelect({ type: 'plan', id: pp.id, data: pp, path: [pp.designRule] })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(`plan-${pp.id}`);
              }}
              className="hover:bg-indigo-100 rounded-lg p-1 transition-colors"
            >
              {expandedNodes[`plan-${pp.id}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <FolderTree className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-bold truncate flex-1">{pp.designRule}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateChild('option', pp, [pp.designRule]);
              }}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>

          {expandedNodes[`plan-${pp.id}`] && (
            <div className="ml-6 pl-4 border-l border-slate-100 space-y-1 py-1">
              {pp.beolOptions.map((bo) => (
                <div key={bo.id} className="space-y-1">
                  <div
                    className={cn(
                      'group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all',
                      selectedNode?.type === 'option' && selectedNode?.id === bo.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                        : 'hover:bg-slate-50 text-slate-500'
                    )}
                    onClick={() => onSelect({ type: 'option', id: bo.id, data: bo, path: [pp.designRule, bo.optionName] })}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(`option-${bo.id}`);
                      }}
                      className="hover:bg-blue-100 rounded-lg p-1 transition-colors"
                    >
                      {expandedNodes[`option-${bo.id}`] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold truncate flex-1">{bo.optionName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateChild('product', bo, [pp.designRule, bo.optionName]);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>

                  {expandedNodes[`option-${bo.id}`] && (
                    <div className="ml-5 pl-4 border-l border-blue-50 space-y-1 py-1">
                      {bo.products.map((prod) => (
                        <div
                          key={prod.id}
                          className={cn(
                            'group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all',
                            selectedNode?.type === 'product' && selectedNode?.id === prod.id
                              ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                              : 'hover:bg-slate-50 text-slate-400'
                          )}
                          onClick={() => onSelect({ type: 'product', id: prod.id, data: prod, path: [pp.designRule, bo.optionName, prod.partId] })}
                        >
                          <Box className="w-3.5 h-3.5 text-emerald-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-wider">{prod.partId}</div>
                            <div className="text-[9px] font-bold opacity-60 truncate">{prod.productName}</div>
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
