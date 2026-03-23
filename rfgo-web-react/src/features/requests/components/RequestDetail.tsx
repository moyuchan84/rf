import React, { useState } from 'react';
import { 
  ExternalLink, 
  Globe, 
  Settings, 
  User, 
  Hash, 
  Clock, 
  Edit3, 
  Trash2,
  FileText,
  Layers,
  Cpu,
  Info,
  Calendar
} from 'lucide-react';
import { type RequestItem } from '../../master-data/types';
import { WorkflowStepper } from './WorkflowStepper';
import { AssigneeManager } from './AssigneeManager';
import { StepWorkArea } from './StepWorkArea/index';
import { REQUEST_TYPE_LABELS, RequestType } from '../types';

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
  const product = request.product;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 pb-16">
      {/* 1. Header Summary (Full Width) */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none transition-all"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-md uppercase tracking-widest border border-indigo-500/20 transition-colors">#REQ-{request.id}</span>
              <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md uppercase tracking-widest border border-emerald-500/20 transition-colors">
                {REQUEST_TYPE_LABELS[request.requestType as RequestType] || request.requestType}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700/50 transition-colors">
                <div className="w-20 h-1 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden transition-colors">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter transition-colors">{progress}%</span>
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">{request.title}</h2>
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={() => onEdit(request)}
              className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-indigo-600 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-md transition-all active:scale-90 border border-slate-200 dark:border-slate-700/50 shadow-sm"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onDelete(request.id)}
              className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-red-600 text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-white rounded-md transition-all active:scale-90 border border-slate-200 dark:border-slate-700/50 shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-10 relative z-10 pt-5 border-t border-slate-100 dark:border-slate-800/50 transition-colors">
          <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 transition-colors">
            <User className="w-3.5 h-3.5 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[8px] font-black uppercase tracking-widest">{request.requesterId}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 transition-colors">
            <Clock className="w-3.5 h-3.5 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[8px] font-black uppercase tracking-widest">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 transition-colors">
            <Hash className="w-3.5 h-3.5 text-indigo-600/50 dark:text-indigo-400/50" />
            <span className="text-[8px] font-black uppercase tracking-widest">PRODUCT ID: {request.productId}</span>
          </div>
        </div>
      </div>

      {/* Product Hierarchy Info (Reorganized Section) */}
      {product && (
        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-8 shadow-sm dark:shadow-xl transition-all">
          <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-1.5 mb-8 transition-colors">
            <Layers className="w-3.5 h-3.5" /> Product Technical Specification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {/* 1. Hierarchy Group */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Settings className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Process Plan</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.beolOption?.processPlan?.designRule || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Layers className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">BEOL Option</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.beolOption?.optionName || 'N/A'}
                </p>
              </div>
            </div>

            {/* 2. Product Identity */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Cpu className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Product / Part ID</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.productName} <span className="text-xs text-slate-400 font-bold ml-1">({product.partId})</span>
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Globe className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Application</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.metaInfo?.application || 'N/A'}
                </p>
              </div>
            </div>

            {/* 3. Business Context */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <User className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Customer</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.metaInfo?.customer || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">MTO Date</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white pl-5 border-l-2 border-indigo-500/20">
                  {product.metaInfo?.mtoDate ? new Date(product.metaInfo.mtoDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* 4. Physical Dimensions */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Info className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Chip Size (X/Y)</span>
                </div>
                <div className="flex items-baseline gap-1 pl-5 border-l-2 border-indigo-500/20">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{product.metaInfo?.chipSizeX?.toFixed(2) || '0'}</span>
                  <span className="text-[10px] font-bold text-slate-400">x</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{product.metaInfo?.chipSizeY?.toFixed(2) || '0'}</span>
                  <span className="text-[8px] font-bold text-slate-400 ml-1 uppercase">mm</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Info className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">SL Size (X/Y)</span>
                </div>
                <div className="flex items-baseline gap-1 pl-5 border-l-2 border-indigo-500/20">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{product.metaInfo?.slSizeX?.toFixed(2) || '0'}</span>
                  <span className="text-[10px] font-bold text-slate-400">x</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{product.metaInfo?.slSizeY?.toFixed(2) || '0'}</span>
                  <span className="text-[8px] font-bold text-slate-400 ml-1 uppercase">mm</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Initial Requirements (Full Width) */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-8 space-y-5 shadow-sm dark:shadow-xl transition-all">
        <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-1.5 transition-colors">
          <FileText className="w-3.5 h-3.5" /> Initial Requirements & Specifications
        </h3>
        <div 
          className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/50 p-6 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none shadow-inner transition-all"
          dangerouslySetInnerHTML={{ __html: request.description }}
        />
      </section>

     

      {/* 4. Technical Info & Sidebar Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* EDM Links */}
        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-6 space-y-3.5 shadow-sm dark:shadow-xl transition-all">
          <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-1.5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> EDM Links
          </h3>
          <div className="space-y-1.5">
            {request.edmList.map((link, i) => (
              <a 
                key={i} 
                href={link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-md hover:border-indigo-500/50 transition-all group shadow-sm"
              >
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[160px] transition-colors">{link}</span>
                <Globe className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </a>
            ))}
            {request.edmList.length === 0 && <p className="text-[8px] text-slate-400 dark:text-slate-600 italic px-1.5 transition-colors">No links provided</p>}
          </div>
        </section>

        {/* PDK Versions */}
        <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-6 space-y-3.5 shadow-sm dark:shadow-xl transition-all">
          <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-1.5 transition-colors">
            <Settings className="w-3.5 h-3.5" /> PDK Versions
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {request.pkdVersions.map((v, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[8px] font-black text-slate-600 dark:text-slate-200 transition-colors shadow-sm">
                {v}
              </span>
            ))}
            {request.pkdVersions.length === 0 && <p className="text-[8px] text-slate-400 dark:text-slate-600 italic px-1.5 transition-colors">No versions provided</p>}
          </div>
        </section>

        {/* Sidebar Content (Assignee + Insights) */}
        <div className="space-y-6">
          <AssigneeManager 
            requestId={request.id} 
            assignees={request.assignees || []} 
            onUpdate={onUpdate}
          />
          
          {/* Status Quick View */}
          <div className="bg-indigo-50 dark:bg-indigo-600/5 border border-indigo-100 dark:border-indigo-500/10 rounded-md p-6 space-y-3.5 shadow-sm dark:shadow-xl transition-all">
            <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] transition-colors">System Insights</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-400 dark:text-slate-500 transition-colors">Status</span>
                <span className="text-indigo-600 dark:text-indigo-400 transition-colors">{steps[currentStepIndex]?.status || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-400 dark:text-slate-500 transition-colors">Last Update</span>
                <span className="text-slate-600 dark:text-slate-300 transition-colors">{new Date(request.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* 2. Workflow Stepper (Full Width) */}
      <WorkflowStepper 
        steps={steps} 
        currentStepIndex={activeStepIndex}
        onStepClick={setActiveStepIndex}
      />

      {/* 5. Active Step Work Area (Full Width) */}
      <div className="w-full">
        {steps[activeStepIndex] && (
          <StepWorkArea 
            step={steps[activeStepIndex]} 
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  );
};
