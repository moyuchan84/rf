import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface Step {
  id: string;
  name: string;
  description: string;
}

interface LayoutStepperProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export const LayoutStepper: React.FC<LayoutStepperProps> = ({ 
  steps, 
  currentStepIndex,
  onStepClick 
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between relative px-4">
        {/* Progress Line */}
        <div className="absolute top-[22px] left-10 right-10 h-0.5 bg-slate-800 z-0"></div>
        
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = index < currentStepIndex;

          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center gap-3 group"
            >
              <button
                onClick={() => onStepClick(index)}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all border-2 active:scale-95",
                  isActive ? "bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)]" : 
                  isDone ? "bg-emerald-600/20 border-emerald-500 text-emerald-500" :
                  "bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500"
                )}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : 
                 isActive ? <Circle className="w-5 h-5 text-white animate-pulse fill-white/20" /> :
                 <span className="text-[10px] font-black">{index + 1}</span>
                }
              </button>
              
              <div className="text-center">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-[0.15em] transition-colors",
                  isActive ? "text-indigo-400" : 
                  isDone ? "text-emerald-500" : "text-slate-600"
                )}>
                  {step.name}
                </p>
                <span className="text-[7px] font-bold text-slate-700 uppercase mt-1 block">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
