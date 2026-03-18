import React from 'react';
import { Settings2 } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { LayerSidebar } from './LayerSidebar';

export const StepFinalize: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <Settings2 className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Final Review & Fine-tune</h3>
      </div>
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
          <LayoutCanvas />
        </div>
        <div className="shrink-0">
          <LayerSidebar />
        </div>
      </div>
    </div>
  );
};
