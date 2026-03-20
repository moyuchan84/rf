import React, { useEffect } from 'react';
import { LayoutStepper, Step } from '../components/LayoutStepper';
import { StepInput } from '../components/StepInput';
import { StepAnalysis } from '../components/StepAnalysis';
import { StepStrategy } from '../components/StepStrategy';
import { StepFinalize } from '../components/StepFinalize';
import { useLayoutDesigner } from '../hooks/useLayoutDesigner';
import { useLayoutStore } from '../store/useLayoutStore';
import { Save, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const STEPS: Step[] = [
  { id: 'input', name: 'Input', description: 'Paste Image or Enter Spec' },
  { id: 'analysis', name: 'Analysis', description: 'Detection & Scaling' },
  { id: 'strategy', name: 'Strategy', description: 'Placement Algorithm' },
  { id: 'finalize', name: 'Finalize', description: 'Manual Adjust & Save' },
];

export const LayoutDesignerPage: React.FC = () => {
  const { autoArrange, saveLayout, handlePaste, nextStep, prevStep, runDetection } = useLayoutDesigner();
  const { 
    setShotInfo, setProductId, reset, 
    title, setTitle, currentStep, setCurrentStep, imageUrl, boundary 
  } = useLayoutStore();

  useEffect(() => {
    // Global paste listener
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    // ONLY set product info, NEVER set boundary here
    setProductId(1);
    setShotInfo({ realW: 25.0, realH: 33.0, pixelW: 0, pixelH: 0 });
  }, [setProductId, setShotInfo]);

  const handleStepClick = async (index: number) => {
    if (index === 1 && currentStep === 0 && imageUrl && !boundary) {
      await runDetection(imageUrl);
    }
    setCurrentStep(index);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <StepInput onNext={nextStep} />;
      case 1: return <StepAnalysis />;
      case 2: return <StepStrategy onAutoArrange={autoArrange} />;
      case 3: return <StepFinalize />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-900 flex items-center justify-between px-8 bg-white dark:bg-slate-950 shrink-0 transition-colors">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xl font-black text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-800 p-0"
              placeholder="Layout Name..."
            />
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Reticle Deployment System v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
             <button onClick={prevStep} disabled={currentStep === 0} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", currentStep === 0 ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm shadow-transparent hover:shadow-md")}>
               <ArrowLeft className="w-3 h-3" /> Prev
             </button>
             <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
             <button onClick={nextStep} disabled={currentStep === 3 || (currentStep === 0 && !imageUrl)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", (currentStep === 3 || (currentStep === 0 && !imageUrl)) ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white hover:bg-white dark:hover:bg-indigo-600/20 shadow-sm shadow-transparent hover:shadow-md")}>
               Next <ArrowRight className="w-3 h-3" />
             </button>
           </div>
           <div className="w-px h-8 bg-slate-200 dark:bg-slate-900 mx-2"></div>
           <button onClick={reset} className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
           {currentStep === 3 && (
             <button onClick={saveLayout} className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-black text-white transition-all shadow-xl shadow-emerald-600/20 active:scale-95 animate-in zoom-in">
               <Save className="w-4 h-4" /> Save
             </button>
           )}
        </div>
      </header>

      <div className="px-8 py-6 shrink-0 bg-slate-100/50 dark:bg-slate-950/50 border-b border-slate-200/40 dark:border-transparent">
        <LayoutStepper steps={STEPS} currentStepIndex={currentStep} onStepClick={handleStepClick} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
         {renderStepContent()}
      </div>
    </div>
  );
};
