import React from 'react';
import { useKeyDesign } from '../hooks/useKeyDesign';
import KeyDesignCard from './KeyDesignCard';
import { KeyDesign } from '../types';

const KeyDesignList: React.FC = () => {
  const { keyDesigns, loading } = useKeyDesign();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse h-96" />
        ))}
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
