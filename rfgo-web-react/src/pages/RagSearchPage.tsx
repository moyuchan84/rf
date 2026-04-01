import React, { useState } from 'react';
import { Send, Sparkles, Database, History, Loader2 } from 'lucide-react';
import { useRagStore } from '../features/rag-search/store/useRagStore';
import { useRagSearch } from '../features/rag-search/hooks/useRagSearch';
import { RagChatMessage } from '../features/rag-search/components/RagChatMessage';

const RagSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const { messages, isLoading, history } = useRagStore();
  const { search } = useRagSearch();

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    const q = query;
    setQuery('');
    await search(q);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex-1 flex gap-8 min-h-0">
      <div className="flex-1 flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 transition-colors">
            RAG Search
            <span className="bg-indigo-600 text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-black flex items-center gap-1 text-white">
              <Sparkles className="w-2 h-2" /> AI
            </span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Intelligent Key Analysis & Query</p>
        </header>

        <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-6 flex flex-col gap-5 relative overflow-hidden shadow-sm transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 pointer-events-none transition-opacity">
            <Database className="w-72 h-72 text-indigo-500" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-3 scrollbar-hide">
            {messages.length === 0 ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                  <Sparkles className="text-white w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-md rounded-tl-none max-w-xl shadow-sm transition-all">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic transition-colors">
                    "Hello! I can help you analyze photo-key data. You can ask things like 'Compare alignment target coordinates between 14nm and 10nm' or 'Find all products using K_ALIGN_V3'."
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <RagChatMessage 
                  key={msg.id} 
                  role={msg.role} 
                  content={msg.content} 
                  results={msg.results} 
                />
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-indigo-600/50 rounded-md flex items-center justify-center shrink-0">
                  <Loader2 className="text-white w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 h-10 w-48 rounded-md rounded-tl-none"></div>
              </div>
            )}
          </div>

          <div className="relative mt-auto">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isLoading ? "AI is thinking..." : "Ask anything about the key data..."}
              disabled={isLoading}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-6 py-4 pr-20 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-600/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm dark:shadow-xl disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="w-64 flex flex-col gap-5 shrink-0">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm transition-all">
          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2 transition-colors">
            <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Recent Queries
          </h4>
          <div className="space-y-3">
            {history.map((q, i) => (
              <div 
                key={i} 
                onClick={() => setQuery(q)}
                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors truncate"
              >
                # {q}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagSearchPage;
