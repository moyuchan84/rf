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
    <div className="flex-1 flex flex-col gap-8 min-h-0 h-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 transition-all">
            <Database className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Master Data</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hierarchy Management</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all shadow-sm dark:shadow-xl text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 text-center transition-all">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight transition-colors">Data Loading Failed</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 font-bold leading-relaxed transition-colors">
            There was an error connecting to the server. Please check if the backend is running on port 9999.
          </p>
          <button 
            onClick={() => refetch()}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
          {/* Left Sidebar: Explorer */}
          <aside className="w-96 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm dark:shadow-2xl flex flex-col overflow-hidden shrink-0 transition-all">
            <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Explorer</span>
              <button
                onClick={() => handleCreateNode('plan', {}, ['ROOT'])}
                className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative">
              {loading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              )}
              <HierarchyExplorer />
            </div>
          </aside>

          {/* Main Content: Form */}
          <main className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm dark:shadow-2xl flex flex-col overflow-hidden transition-all">
            {selectedNode || isFormOpen ? (
              <MasterDataForm key={selectedNode ? `${selectedNode.type}-${selectedNode.id}` : 'form'} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none transition-all"></div>
                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl transition-all">
                  <Database className="text-slate-300 dark:text-slate-800 w-16 h-16 transition-colors" />
                </div>
                <h3 className="text-sm font-black text-slate-400 dark:text-white mb-3 uppercase tracking-[0.4em] transition-colors">Select an Item</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed font-bold transition-colors">
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
