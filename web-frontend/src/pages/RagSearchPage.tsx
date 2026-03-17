import React, { useState } from 'react';
import { Send, Sparkles, Database, History } from 'lucide-react';

const RagSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex-1 flex gap-10 min-h-0">
      <div className="flex-1 flex flex-col gap-8">
        <header>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
            RAG Search
            <span className="bg-indigo-600 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black flex items-center gap-1 text-white">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Intelligent Key Analysis & Query</p>
        </header>

        <div className="flex-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 flex flex-col gap-6 relative overflow-hidden shadow-sm transition-all">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none transition-opacity">
            <Database className="w-96 h-96 text-indigo-500" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl rounded-tl-none max-w-2xl shadow-sm transition-all">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold italic transition-colors">
                  "Hello! I can help you analyze photo-key data. You can ask things like 'Compare alignment target coordinates between 14nm and 10nm' or 'Find all products using K_ALIGN_V3'."
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-auto">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the key data..."
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] px-8 py-6 pr-24 text-base text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-600/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm dark:shadow-2xl"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm transition-all">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors">
            <History className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Recent Queries
          </h4>
          <div className="space-y-4">
            {[
              "14nm Key Table Summary",
              "Exynos 2200 vs 2100",
              "Missing Target List"
            ].map((q, i) => (
              <div key={i} className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors truncate">
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
