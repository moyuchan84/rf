import React, { useState, useEffect } from 'react';
import { type RequestStep } from '../../master-data/types';
import { useMutation } from '@apollo/client/react';
import { UPDATE_REQUEST_STEP } from '../api/requestQueries';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, CheckCircle2, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface StepWorkAreaProps {
  step: RequestStep;
  onUpdate: () => void;
}

export const StepWorkArea: React.FC<StepWorkAreaProps> = ({ step, onUpdate }) => {
  const [content, setContent] = useState(step.workContent || '');
  const [status, setStatus] = useState(step.status);

  useEffect(() => {
    setContent(step.workContent || '');
    setStatus(step.status);
  }, [step]);

  const [updateStepMutation] = useMutation(UPDATE_REQUEST_STEP, {
    onCompleted: () => {
      toast.success(`${step.stepName} updated`);
      onUpdate();
    }
  });

  const handleSave = async (newStatus?: string) => {
    await updateStepMutation({
      variables: {
        input: {
          stepId: step.id,
          status: newStatus || status,
          workContent: content,
          workerId: 'EMP_123456' // Current user
        }
      }
    });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{step.stepName}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
            Current Status: <span className="text-indigo-400">{status}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {status !== 'DONE' && (
            <>
              {status === 'TODO' && (
                <button 
                  onClick={() => handleSave('IN_PROGRESS')}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600/20 transition-all"
                >
                  <PlayCircle className="w-4 h-4" /> Start Work
                </button>
              )}
              <button 
                onClick={() => handleSave('DONE')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark as Done
              </button>
            </>
          )}
          <button 
            onClick={() => handleSave()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 block">
          Work Logs & Results
        </label>
        <div className="bg-slate-950 border-2 border-slate-800 rounded-[2rem] overflow-hidden focus-within:border-indigo-500/30 transition-all shadow-2xl">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent}
            placeholder="Document your findings, table mappings, or verification results here..."
          />
        </div>
      </div>

      {step.completedAt && (
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <span>Worker: {step.workerId}</span>
          <span>Completed At: {new Date(step.completedAt).toLocaleString()}</span>
        </div>
      )}

      <style>{`
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #1e293b; padding: 12px 20px; background: #0f172a; }
        .ql-container.ql-snow { border: none; min-height: 250px; font-size: 14px; font-family: inherit; }
        .ql-editor { padding: 25px; color: #f1f5f9; }
        .ql-snow .ql-stroke { stroke: #64748b; }
        .ql-snow .ql-fill { fill: #64748b; }
        .ql-snow .ql-picker { color: #64748b; }
      `}</style>
    </div>
  );
};
