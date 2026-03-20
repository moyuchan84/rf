import React from 'react';

const Inventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Key Inventory</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <aside className="col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Filters</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Process Plan</label>
              <select className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                <option>All</option>
              </select>
            </div>
          </div>
        </aside>
        
        <main className="col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 font-bold italic">Master data and key tables will be listed here.</p>
        </main>
      </div>
    </div>
  );
};

export default Inventory;
