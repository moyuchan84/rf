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
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const requestsList = useRequestsList();
  const { requests, refetch, deleteRequest } = requestsList;

  const selectedRequest = requests.find((r: RequestItem) => r.id === selectedRequestId);

  const handleRequestClick = (req: RequestItem) => {
    setSelectedRequestId(req.id);
    setView('detail');
  };

  const handleEditClick = (e: React.MouseEvent | null, req: RequestItem) => {
    if (e) e.stopPropagation();
    setSelectedRequestId(req.id);
    setView('edit');
  };

  const handleDeleteClick = async (e: React.MouseEvent | null, id: number) => {
    if (e) e.stopPropagation();
    await deleteRequest(id);
    if (selectedRequestId === id) {
      setSelectedRequestId(null);
      setView('list');
    }
  };

  const handleSuccess = () => {
    refetch();
    setView('list');
    setSelectedRequestId(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 h-full overflow-hidden">
      <header className="flex items-center justify-between shrink-0 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-5">         
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors">의뢰정보</h1>
            <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2 transition-colors">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              Photo-Key Design & Technical Submission
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {view !== 'list' ? (
            <button
              onClick={() => {
                setView('list');
                setSelectedRequestId(null);
              }}
              className="group flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md transition-all shadow-sm dark:shadow-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </button>
          ) : (
            <button
              onClick={() => setView('create')}
              className="group flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all shadow-lg shadow-indigo-600/20 text-[10px] font-black text-white uppercase tracking-widest active:scale-95 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Plus className="w-3.5 h-3.5" />
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
            onEdit={() => setView('edit')}
            onDelete={id => handleDeleteClick(null, id)}
            onUpdate={refetch}
          />
        ) : (
          <RequestList 
            requestsList={requestsList}
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
