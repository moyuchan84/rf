import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-md p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between relative px-4">
        {/* Progress Line */}
        <div className="absolute top-[22px] left-10 right-10 h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
        
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = step.status === 'DONE';
          const isLocked = index > 0 && steps[index - 1].status !== 'DONE';

          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center gap-3 group"
            >
              <button
                onClick={() => !isLocked && onStepClick(index)}
                disabled={isLocked}
                className={cn(
                  "w-11 h-11 rounded-md flex items-center justify-center transition-all border-2 active:scale-95",
                  isActive ? "bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20 dark:shadow-[0_0_20px_rgba(79,70,229,0.4)]" : 
                  isDone ? "bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-600 dark:text-emerald-500" :
                  isLocked ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed" :
                  "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-500"
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
                  isActive ? "text-indigo-600 dark:text-indigo-400" : 
                  isDone ? "text-emerald-600 dark:text-emerald-500" : 
                  isLocked ? "text-slate-300 dark:text-slate-700" : "text-slate-400 dark:text-slate-600"
                )}>
                  {step.stepName}
                </p>
                <span className="text-[7px] font-bold text-slate-400 dark:text-slate-700 uppercase mt-1 block tracking-wider">
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
