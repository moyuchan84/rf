import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROCESS_PLANS } from './queries';
import type { ProcessPlan, SelectedNode } from './types';
import HierarchyExplorer from './HierarchyExplorer';
import MasterDataForm from './MasterDataForm';
import { RefreshCcw, Database } from 'lucide-react';

const MasterDataPage: React.FC = () => {
  const { data, loading, refetch } = useQuery<{ processPlans: ProcessPlan[] }>(GET_PROCESS_PLANS);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('edit');

  const handleSelectNode = (node: SelectedNode) => {
    setSelectedNode(node);
    setFormMode('edit');
  };

  const handleCreateNode = (type: SelectedNode['type'], parentData?: any, path: string[] = []) => {
    setSelectedNode({ type, id: 0, data: parentData || {}, path });
    setFormMode('create');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6 bg-slate-50">
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
            <Database className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Data</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hierarchy Management</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm font-bold text-slate-600"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Left Sidebar: Explorer */}
        <aside className="w-96 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Explorer</span>
            <button
              onClick={() => handleCreateNode('plan', {}, ['ROOT'])}
              className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <span className="text-xl">+</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <HierarchyExplorer
              data={data?.processPlans || []}
              selectedNode={selectedNode}
              onSelect={handleSelectNode}
              onCreateChild={handleCreateNode}
            />
          </div>
        </aside>

        {/* Main Content: Form */}
        <main className="flex-1 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
          {selectedNode ? (
            <MasterDataForm
              node={selectedNode}
              mode={formMode}
              onSuccess={() => {
                refetch();
                setSelectedNode(null);
              }}
              onCancel={() => setSelectedNode(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100">
                <Database className="text-slate-200 w-12 h-12" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2 uppercase tracking-[0.2em]">Select an Item</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Choose a process plan, BEOL option, or product from the explorer to manage its information.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MasterDataPage;
