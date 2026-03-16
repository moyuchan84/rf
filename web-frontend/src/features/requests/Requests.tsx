import React, { useState } from 'react';
import { Plus, List, ArrowLeft, Search, Filter, Cpu, Calendar, User, FileText, ExternalLink, Hash, ArrowRight } from 'lucide-react';
import RequestStepForm from './components/RequestStepForm';
import { useRequestsList } from './hooks/useRequestsList';

const Requests: React.FC = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const { requests, loading } = useRequestsList(null); // Fetch all or filter in a real scenario

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
          {view === 'create' ? (
            <button
              onClick={() => setView('list')}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 rounded-2xl transition-all shadow-2xl text-xs font-black text-slate-400 uppercase tracking-widest active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Requests
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
        {view === 'create' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <RequestStepForm />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Filters/Search placeholder */}
            <div className="flex gap-4 p-2 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search requests by title, product, or requester..."
                  className="w-full bg-transparent pl-14 pr-6 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-700"
                />
              </div>
              <button className="px-6 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-400 transition-all flex items-center gap-3 active:scale-95">
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
              </button>
            </div>

            {loading ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-24 text-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid gap-6">
                {requests.map((req) => (
                  <article 
                    key={req.id}
                    className="group bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 rounded-[2.5rem] p-8 transition-all hover:bg-slate-900 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)] cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-6">
                        <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors group-hover:border-indigo-500 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                          <FileText className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-500/20">#REQ-{req.id}</span>
                            <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-700/50 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{req.title}</h3>
                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-slate-500">
                              <User className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{req.requesterId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Hash className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Product ID: {req.productId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{req.edmList.length} EDM Links</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Cpu className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{req.pkdVersions.length} PDK Versions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-full bg-slate-950 border border-slate-800 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-all">
                        <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.03),transparent)] pointer-events-none"></div>
                <div className="w-32 h-32 bg-slate-950 rounded-2xl flex items-center justify-center mb-10 border border-slate-800 shadow-2xl relative z-10">
                  <List className="text-slate-800 w-16 h-16" />
                </div>
                <h3 className="text-sm font-black text-white mb-4 uppercase tracking-[0.5em] relative z-10">System is Empty</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-bold mb-12 relative z-10 uppercase tracking-widest">
                  No active photo-key requests detected in the repository. Initiate a new submission to begin.
                </p>
                <button 
                  onClick={() => setView('create')}
                  className="group relative z-10 flex items-center gap-4 px-10 py-5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 border-2 border-slate-800 hover:border-indigo-600/50 shadow-2xl"
                >
                  <Plus className="w-4 h-4 text-indigo-500 group-hover:scale-125 transition-transform" />
                  Initiate First Request
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;
