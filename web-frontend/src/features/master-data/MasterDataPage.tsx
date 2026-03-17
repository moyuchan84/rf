import React from 'react';
import { RefreshCcw, Database, AlertCircle, Loader2 } from 'lucide-react';
import HierarchyExplorer from './components/HierarchyExplorer';
import MasterDataForm from './components/MasterDataForm';
import { useMasterData } from './hooks/useMasterData';
import { type MasterDataType } from './types';

const MasterDataPage: React.FC = () => {
  const { 
    loading, 
    error,
    refetch, 
    selectedNode, 
    setSelectedNode, 
    isFormOpen, 
    setIsFormOpen 
  } = useMasterData();

  const handleCreateNode = (type: MasterDataType, parentData?: { parentId?: string | number }, path: string[] = []) => {
    setSelectedNode({ type, id: -1, data: parentData || {}, path });
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 h-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">          
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">제품정보</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hierarchy Management</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md transition-all shadow-sm dark:shadow-lg text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-red-500/5 border border-red-500/20 rounded-md p-10 text-center transition-all">
          <AlertCircle className="w-12 h-12 text-red-500 mb-5" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5 uppercase tracking-tight transition-colors">Data Loading Failed</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm font-bold leading-relaxed transition-colors">
            There was an error connecting to the server. Please check if the backend is running on port 9999.
          </p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left Sidebar: Explorer */}
          <aside className="w-72 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl flex flex-col overflow-hidden shrink-0 transition-all">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">Explorer</span>
              <button
                onClick={() => handleCreateNode('plan', {}, ['ROOT'])}
                className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <span className="text-xl font-light">+</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide relative">
              {loading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              )}
              <HierarchyExplorer />
            </div>
          </aside>

          {/* Main Content: Form */}
          <main className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl flex flex-col overflow-hidden transition-all">
            {selectedNode || isFormOpen ? (
              <MasterDataForm key={selectedNode ? `${selectedNode.type}-${selectedNode.id}` : 'form'} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none transition-all"></div>
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-md flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                  <Database className="text-slate-300 dark:text-slate-800 w-12 h-12 transition-colors" />
                </div>
                <h3 className="text-xs font-black text-slate-400 dark:text-white mb-2 uppercase tracking-[0.4em] transition-colors">Select an Item</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed font-bold transition-colors">
                  Choose a process plan, BEOL option, or product from the explorer to manage its information.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default MasterDataPage;
