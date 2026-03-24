import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useKeyDesignStore } from '../features/key-design/store/keyDesignStore';
import KeyDesignForm from '../features/key-design/components/KeyDesignForm';
import KeyDesignList from '../features/key-design/components/KeyDesignList';
import KeyDesignDetail from '../features/key-design/components/KeyDesignDetail';
import { useMasterData } from '@/features/master-data/hooks/useMasterData';

const KeyDesignPage: React.FC = () => {
  const { openCreateModal } = useKeyDesignStore();
  const { processPlans } = useMasterData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [keyType, setKeyType] = useState<string | null>(null);
  const [processPlanId, setProcessPlanId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">키디자인</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Manage Photo Key Blueprints</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          NEW DESIGN
        </button>
      </div>

      <div className="space-y-3 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm dark:shadow-xl transition-all">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 dark:bg-slate-950/50 pl-12 pr-5 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 rounded-md outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 border rounded-md transition-all flex items-center gap-2.5 active:scale-95 shadow-sm ${
              showFilters || keyType || processPlanId 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[8px] font-black uppercase tracking-widest">Filter</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Key Type</label>
              <input 
                type="text"
                value={keyType || ''}
                onChange={(e) => setKeyType(e.target.value || null)}
                placeholder="Search by Key Type..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Process Plan</label>
              <select 
                value={processPlanId || ''}
                onChange={(e) => setProcessPlanId(Number(e.target.value) || null)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">ALL PLANS</option>
                {processPlans.map(p => (
                  <option key={p.id} value={p.id}>{p.designRule}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <KeyDesignList filters={{ search: searchQuery, keyType: keyType || undefined, processPlanId }} />
      <KeyDesignForm />
      <KeyDesignDetail />
    </div>
  );
};

export default KeyDesignPage;
