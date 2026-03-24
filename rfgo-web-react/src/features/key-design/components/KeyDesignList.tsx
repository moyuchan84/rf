import React from 'react';
import { useKeyDesign } from '../hooks/useKeyDesign';
import KeyDesignCard from './KeyDesignCard';
import { KeyDesign } from '../types';
import { Database } from 'lucide-react';

interface KeyDesignListProps {
  filters?: { search?: string; keyType?: string; processPlanId?: number | null };
}

const KeyDesignList: React.FC<KeyDesignListProps> = ({ filters }) => {
  const { keyDesigns, loading } = useKeyDesign(filters);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse h-96" />
        ))}
      </div>
    );
  }

  if (keyDesigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl opacity-50">
        <Database className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">No key designs found matching your search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {keyDesigns.map((design: KeyDesign) => (
        <KeyDesignCard key={design.id} design={design} />
      ))}
    </div>
  );
};

export default KeyDesignList;
