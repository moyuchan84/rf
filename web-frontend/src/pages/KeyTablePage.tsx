import React from 'react';
import { Download, Search } from 'lucide-react';

const KeyTablePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Photo Key Table</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Structured Key Data Review</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">
            <Search className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Process Plan</p>
              <p className="text-sm text-indigo-400 font-black">14nm_LPE</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Product</p>
              <p className="text-sm text-white font-black uppercase">Exynos_2200</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Keys</p>
              <p className="text-sm text-white font-black">128</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Verified</div>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50">
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Key Name</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Alias</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Coord X</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Coord Y</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Style</th>
                <th className="p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-6 text-sm font-bold text-slate-300 tracking-tight">K_ALIGN_00{i}</td>
                  <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Main_Align_Target</td>
                  <td className="p-6 text-xs font-mono text-indigo-400">12.045</td>
                  <td className="p-6 text-xs font-mono text-indigo-400">-5.221</td>
                  <td className="p-6">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/20"></div>
                  </td>
                  <td className="p-6">
                    <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">Compare</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeyTablePage;
