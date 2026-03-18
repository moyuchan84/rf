import React from 'react';
import { Crosshair } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';

export const StepAnalysis: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <Crosshair className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Detection & Boundary Review</h3>
      </div>
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
        <LayoutCanvas />
      </div>
    </div>
  );
};
