import React from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { type RequestStep } from '../../master-data/types';
import { cn } from '@/shared/utils/cn';

interface WorkflowStepperProps {
  steps: RequestStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ 
  steps, 
  currentStepIndex,
  onStepClick 
}) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
        
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = step.status === 'DONE';
          const isPending = step.status === 'TODO';
          const isLocked = index > 0 && steps[index - 1].status !== 'DONE';

          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center gap-4 group"
            >
              <button
                onClick={() => !isLocked && onStepClick(index)}
                disabled={isLocked}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 active:scale-95",
                  isActive ? "bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)]" : 
                  isDone ? "bg-emerald-600/20 border-emerald-500 text-emerald-500" :
                  isLocked ? "bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed" :
                  "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                )}
              >
                {isDone ? <CheckCircle2 className="w-6 h-6" /> : 
                 isActive ? <Clock className="w-6 h-6 text-white animate-pulse" /> :
                 <span className="text-xs font-black">{index + 1}</span>
                }
              </button>
              
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-indigo-400" : 
                  isDone ? "text-emerald-500" : 
                  isLocked ? "text-slate-700" : "text-slate-500"
                )}>
                  {step.stepName}
                </p>
                <span className="text-[8px] font-bold text-slate-600 uppercase mt-1 block">
                  {step.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
