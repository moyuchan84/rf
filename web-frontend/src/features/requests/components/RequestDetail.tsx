import React, { useState } from 'react';
import { 
  Info, 
  ExternalLink, 
  Globe, 
  Settings, 
  User, 
  Hash, 
  Clock, 
  Edit3, 
  Trash2,
  FileText
} from 'lucide-react';
import { type RequestItem } from '../../master-data/types';
import { WorkflowStepper } from './WorkflowStepper';
import { AssigneeManager } from './AssigneeManager';
import { StepWorkArea } from './StepWorkArea';

interface RequestDetailProps {
  request: RequestItem;
  onEdit: (req: RequestItem) => void;
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({ 
  request, 
  onEdit, 
  onDelete,
  onUpdate
}) => {
  const steps = request.steps || [];
  const currentStepIndex = steps.findIndex(s => s.status !== 'DONE');
  const [activeStepIndex, setActiveStepIndex] = useState(currentStepIndex === -1 ? 3 : currentStepIndex);

  const progress = Math.round((steps.filter(s => s.status === 'DONE').length / 4) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      {/* 1. Header Summary (Full Width) */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm dark:shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none transition-all"></div>
        
        <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-500/20 transition-colors">#REQ-{request.id}</span>
              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-500/20 transition-colors">{request.requestType}</span>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-colors">
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden transition-colors">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter transition-colors">{progress}% COMPLETE</span>
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">{request.title}</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onEdit(request)}
              className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-indigo-600 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-xl"
            >
              <Edit3 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => onDelete(request.id)}
              className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-red-600 text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-xl"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-12 relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 transition-colors">
            <User className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[10px] font-black uppercase tracking-widest">{request.requesterId}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 transition-colors">
            <Clock className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 transition-colors">
            <Hash className="w-4 h-4 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[10px] font-black uppercase tracking-widest">PRODUCT ID: {request.productId}</span>
          </div>
        </div>
      </div>

    
      {/* 3. Initial Requirements (Full Width - New) */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 space-y-6 shadow-sm dark:shadow-xl transition-all">
        <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 transition-colors">
          <FileText className="w-4 h-4" /> Initial Requirements & Specifications
        </h3>
        <div 
          className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/50 p-8 rounded-[2rem] text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none shadow-inner transition-all"
          dangerouslySetInnerHTML={{ __html: request.description }}
        />
      </section>

        {/* 2. Workflow Stepper (Full Width) */}
      <WorkflowStepper 
        steps={steps} 
        currentStepIndex={activeStepIndex}
        onStepClick={setActiveStepIndex}
      />


      {/* 4. Main Grid (Work Area & Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Active Step Content */}
          {steps[activeStepIndex] && (
            <StepWorkArea 
              step={steps[activeStepIndex]} 
              onUpdate={onUpdate}
            />
          )}

          {/* Technical Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 space-y-4 shadow-sm dark:shadow-xl transition-all">
              <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 transition-colors">
                <ExternalLink className="w-4 h-4" /> EDM Links
              </h3>
              <div className="space-y-2">
                {request.edmList.map((link, i) => (
                  <a 
                    key={i} 
                    href={link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 transition-all group shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[200px] transition-colors">{link}</span>
                    <Globe className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </a>
                ))}
                {request.edmList.length === 0 && <p className="text-[10px] text-slate-400 dark:text-slate-600 italic px-2 transition-colors">No links provided</p>}
              </div>
            </section>
            <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 space-y-4 shadow-sm dark:shadow-xl transition-all">
              <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" /> PDK Versions
              </h3>
              <div className="flex flex-wrap gap-2">
                {request.pkdVersions.map((v, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-200 transition-colors shadow-sm">
                    {v}
                  </span>
                ))}
                {request.pkdVersions.length === 0 && <p className="text-[10px] text-slate-400 dark:text-slate-600 italic px-2 transition-colors">No versions provided</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <AssigneeManager 
            requestId={request.id} 
            assignees={request.assignees || []} 
            onUpdate={onUpdate}
          />
          
          {/* Status Quick View */}
          <div className="bg-indigo-50 dark:bg-indigo-600/5 border border-indigo-100 dark:border-indigo-500/10 rounded-[2rem] p-8 space-y-4 shadow-sm dark:shadow-xl transition-all">
            <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] transition-colors">System Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-400 dark:text-slate-500 transition-colors">Status</span>
                <span className="text-indigo-600 dark:text-indigo-400 transition-colors">{steps[currentStepIndex]?.status || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-400 dark:text-slate-500 transition-colors">Last Update</span>
                <span className="text-slate-600 dark:text-slate-300 transition-colors">{new Date(request.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
