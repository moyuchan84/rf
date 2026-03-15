import React from 'react';

const Requests: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Photo-Key Requests</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
          New Request
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-12 text-center">
          <p class="text-slate-400 font-bold italic">Requests list will be populated here.</p>
        </div>
      </div>
    </div>
  );
};

export default Requests;
