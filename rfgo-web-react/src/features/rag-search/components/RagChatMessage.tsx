import React from 'react';
import { Sparkles, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      
      <div className={`flex flex-col gap-3 max-w-2xl ${isAssistant ? '' : 'items-end'}`}>
        <div className={`p-4 rounded-md shadow-sm transition-all border ${
          isAssistant 
            ? 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 rounded-tl-none' 
            : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
        }`}>
          <div className={`prose dark:prose-invert prose-xs max-w-none font-bold ${isAssistant ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-800 rounded-md">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => (
                  <th className="px-3 py-2 bg-slate-100 dark:bg-slate-900 text-left text-[10px] font-black uppercase tracking-widest text-slate-500" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="px-3 py-2 text-[11px] border-t border-slate-100 dark:border-slate-800" {...props} />
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {results && results.length > 0 && (
          <div className="grid grid-cols-1 gap-2 w-full">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Database className="w-3 h-3" /> Raw Context References
            </div>
            {results.map((res, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-md shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                    {res.table_name} (Rev {res.rev_no})
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">Score: {(res.score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                  "{res.content.substring(0, 100)}..."
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
