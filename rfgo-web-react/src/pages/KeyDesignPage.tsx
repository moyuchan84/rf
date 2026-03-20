import React from 'react';
import { Plus } from 'lucide-react';
import { useKeyDesignStore } from '../features/key-design/store/keyDesignStore';
import KeyDesignForm from '../features/key-design/components/KeyDesignForm';
import KeyDesignList from '../features/key-design/components/KeyDesignList';
import KeyDesignDetail from '../features/key-design/components/KeyDesignDetail';

const KeyDesignPage: React.FC = () => {
  const { openCreateModal } = useKeyDesignStore();

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

      <KeyDesignList />
      <KeyDesignForm />
      <KeyDesignDetail />
    </div>
  );
};

export default KeyDesignPage;
