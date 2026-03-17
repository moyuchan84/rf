import React, { useState } from 'react';
import { 
  Plus, 
  ArrowLeft
} from 'lucide-react';
import RequestStepForm from './components/RequestStepForm';
import { RequestList } from './components/RequestList';
import { RequestDetail } from './components/RequestDetail';
import { useRequestsList } from './hooks/useRequestsList';
import { type RequestItem } from '../master-data/types';

const Requests: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const { requests, loading, deleteRequest, refetch } = useRequestsList(null);

  const handleRequestClick = (req: RequestItem) => {
    setSelectedRequest(req);
    setView('detail');
  };

  const handleEditClick = (e: React.MouseEvent | null, req: RequestItem) => {
    if (e) e.stopPropagation();
    setSelectedRequest(req);
    setView('edit');
  };

  const handleDeleteClick = async (e: React.MouseEvent | null, id: number) => {
    if (e) e.stopPropagation();
    await deleteRequest(id);
    if (selectedRequest?.id === id) {
      setSelectedRequest(null);
      setView('list');
    }
  };

  const handleSuccess = () => {
    refetch();
    setView('list');
    setSelectedRequest(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 min-h-0 h-full overflow-hidden">
      <header className="flex items-center justify-between shrink-0 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <Plus className="text-white w-9 h-9" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Requests Hub</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Photo-Key Design & Technical Submission
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {view !== 'list' ? (
            <button
              onClick={() => {
                setView('list');
                setSelectedRequest(null);
              }}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 rounded-2xl transition-all shadow-2xl text-xs font-black text-slate-400 uppercase tracking-widest active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </button>
          ) : (
            <button
              onClick={() => setView('create')}
              className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] text-xs font-black text-white uppercase tracking-widest active:scale-95 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Plus className="w-4 h-4" />
              New Request
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-12">
        {view === 'create' || view === 'edit' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <RequestStepForm 
              initialData={view === 'edit' ? selectedRequest : null} 
              onSuccess={handleSuccess}
            />
          </div>
        ) : view === 'detail' && selectedRequest ? (
          <RequestDetail 
            request={selectedRequest}
            onEdit={req => setView('edit')}
            onDelete={id => handleDeleteClick(null, id)}
          />
        ) : (
          <RequestList 
            requests={requests}
            loading={loading}
            onRequestClick={handleRequestClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onCreateClick={() => setView('create')}
          />
        )}
      </main>
    </div>
  );
};

export default Requests;
