import React from 'react';
import { Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { useLayoutStore } from '../store/useLayoutStore';

interface StepInputProps {
  onNext: () => void;
}

export const StepInput: React.FC<StepInputProps> = ({ onNext }) => {
  const { imageUrl, setImageUrl } = useLayoutStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500 overflow-hidden">
      {!imageUrl ? (
        <div className="flex flex-col items-center gap-8">
          <div className="w-40 h-40 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center transition-all shadow-sm dark:shadow-2xl">
            <ImageIcon className="w-16 h-16 text-slate-200 dark:text-slate-700 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter transition-colors">Reticle Image Source</h3>
            <p className="text-slate-400 dark:text-slate-500 text-base max-w-sm leading-relaxed transition-colors">
              Press <kbd className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-black mx-1 transition-colors">Ctrl + V</kbd> 
              to paste a reticle screenshot.
            </p>
          </div>
          <button 
            onClick={onNext}
            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl"
          >
            Enter Specs Manually
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl h-full flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-md flex items-center justify-center transition-colors">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white transition-colors">Preview Pasted Image</h3>
            </div>
            <button 
              onClick={() => setImageUrl(null)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-500 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
              Clear Image
            </button>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200/60 dark:border-slate-800 p-4 overflow-hidden shadow-sm dark:shadow-2xl relative group transition-colors">
            <div className="absolute inset-0 bg-indigo-500/[0.02] dark:bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <img 
              src={imageUrl} 
              alt="Pasted Reticle" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>

          <div className="flex justify-center pt-2">
            <button 
              onClick={onNext}
              className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-600/40 hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
