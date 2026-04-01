import React from 'react';
import { Sparkles, FileText, Database } from 'lucide-react';
import { RagSearchResult } from '../api/ragApi';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  results?: RagSearchResult[];
}

export const RagChatMessage: React.FC<MessageProps> = ({ role, content, results }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 shadow-md ${
        isAssistant ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-slate-700 shadow-slate-700/20'
      }`}>
        {isAssistant ? <Sparkles className="text-white w-4 h-4" /> : <div className="text-white text-[10px] font-black">YOU</div>}
      </div>
      
      <div className={`flex flex-col gap-3 max-w-xl ${isAssistant ? '' : 'items-end'}`}>
        <div className={`p-4 rounded-md shadow-sm transition-all border ${
          isAssistant 
            ? 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-tl-none' 
            : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
        }`}>
          <p className={`text-sm leading-relaxed font-bold ${isAssistant ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>
            {content}
          </p>
        </div>

        {results && results.length > 0 && (
          <div className="grid grid-cols-1 gap-2 w-full">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Database className="w-3 h-3" /> Source References
            </div>
            {results.map((res, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-md shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                    {res.table_name} (Rev {res.rev_no})
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">Score: {(res.score * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 flex gap-2">
                   <span>{res.product_info.partid}</span>
                   <span>•</span>
                   <span>{res.product_info.name}</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 italic">
                  "{res.content.split('|')[0]}..."
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
