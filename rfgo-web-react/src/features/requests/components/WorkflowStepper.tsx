import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
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
    <div className="bg-slate-50/30 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-md p-8 shadow-sm">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
        
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isDone = step.status === 'DONE';
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
                  "w-12 h-12 rounded-md flex items-center justify-center transition-all border-2 active:scale-95 shadow-sm",
                  isActive ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20" : 
                  isDone ? "bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-600 dark:text-emerald-500" :
                  isLocked ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700 cursor-not-allowed" :
                  "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-slate-600"
                )}
              >
                {isDone ? <CheckCircle2 className="w-6 h-6" /> : 
                 isActive ? <Clock className="w-6 h-6 animate-pulse" /> :
                 <span className="text-xs font-black">{index + 1}</span>
                }
              </button>
              
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : 
                  isDone ? "text-emerald-600 dark:text-emerald-500" : 
                  isLocked ? "text-slate-400 dark:text-slate-700" : "text-slate-500 dark:text-slate-500"
                )}>
                  {step.stepName}
                </p>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase mt-1 block">
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
