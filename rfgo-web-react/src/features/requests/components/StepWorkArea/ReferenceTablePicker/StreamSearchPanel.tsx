import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { Search, Loader2, Database, AlertCircle, X } from 'lucide-react';
import { SEARCH_PHOTO_KEYS_BY_STREAM } from '../../../api/requestQueries';
import { PhotoKey } from '@/features/master-data/types';

interface StreamSearchPanelProps {
  productId: number;
  onResultsFound: (keys: PhotoKey[]) => void;
  onClear: () => void;
}

export const StreamSearchPanel: React.FC<StreamSearchPanelProps> = ({ 
  productId, 
  onResultsFound,
  onClear
}) => {
  const [query, setQuery] = useState('');
  
  const [search, { loading, data, error }] = useLazyQuery<{ searchPhotoKeysByStream: PhotoKey[] }, { query: string }>(
    SEARCH_PHOTO_KEYS_BY_STREAM, 
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (data?.searchPhotoKeysByStream) {
      onResultsFound(data.searchPhotoKeysByStream);
    }
  }, [data, onResultsFound]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        search({ variables: { query } });
      } else if (query.trim().length === 0) {
        onClear();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, search, onClear]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Search by Stream File</h4>
          <p className="text-[8px] font-bold text-slate-400 uppercase">Find SETUP tables linked to original stream request</p>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Stream File Name or Token (e.g. APPLE)..."
          className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-md pl-8 pr-8 py-2 text-[10px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </div>
        {query && (
          <button 
            onClick={() => { setQuery(''); onClear(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-md text-red-500 text-[9px] font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          Failed to search stream data. Please try again.
        </div>
      )}

      {!loading && query.length >= 2 && data?.searchPhotoKeysByStream?.length === 0 && (
        <div className="p-4 text-center border border-dashed border-slate-100 dark:border-slate-800 rounded-md">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">No Setup Tables found for this stream info</p>
        </div>
      )}
    </div>
  );
};
