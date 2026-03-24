import React, { useEffect, useMemo } from 'react';
import { type RequestStep } from '../../../master-data/types';
import { useMutation, useQuery } from '@apollo/client/react';
import { 
  UPDATE_REQUEST_STEP, 
  GET_REQUEST_ITEM
} from '../../api/requestQueries';
import { 
  type GetRequestItemQuery, 
  type GetRequestItemQueryVariables, 
  type UpdateRequestStepMutation, 
  type UpdateRequestStepMutationVariables 
} from '@/shared/api/generated/graphql';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, CheckCircle2, PlayCircle, RotateCcw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStepWorkStore } from '../../store/useStepWorkStore';
import { ReferenceTablePicker } from './ReferenceTablePicker';
import { KeyTableSetupPicker } from './KeyTableSetupPicker';
import { StreamInfoForm } from './StreamInfoForm';
import { GdsPathForm } from './GdsPathForm';
import { ApprovalSubmissionForm } from './Approval/ApprovalSubmissionForm';
import { useUserStore, RoleName } from '../../auth/store/useUserStore';

interface StepWorkAreaProps {
  step: RequestStep;
  onUpdate: () => void;
}

export const StepWorkArea: React.FC<StepWorkAreaProps> = ({ step, onUpdate }) => {
  const { content, setContent, status, setStatus, initialize } = useStepWorkStore();
  const user = useUserStore((state) => state.user);
  const userRole = useUserStore((state) => state.role);

  useEffect(() => {
    initialize(step);
  }, [step, initialize]);

  // Permission Mapping
  const stepPermissions: Record<string, RoleName[]> = {
    'ReferenceTable': ['ADMIN', 'RFG'],
    'KeyTableSetup': ['ADMIN', 'INNO'],
    'GDSPath': ['ADMIN', 'INNO', 'RFG'],
    'StreamInfo': ['ADMIN', 'INNO', 'RFG'],
    'RequestSubmission': ['ADMIN', 'INNO'],
  };

  const hasPermission = useMemo(() => {
    const allowedRoles = stepPermissions[step.stepName] || [];
    return userRole ? allowedRoles.includes(userRole) : false;
  }, [step.stepName, userRole]);

  // Fetch full request details to get productId, etc.
  const { data: requestData, loading } = useQuery<GetRequestItemQuery, GetRequestItemQueryVariables>(GET_REQUEST_ITEM, {
    variables: { id: step.requestId },
    skip: !step.requestId
  });
  const request = requestData?.requestItem;

  const [updateStepMutation] = useMutation<UpdateRequestStepMutation, UpdateRequestStepMutationVariables>(UPDATE_REQUEST_STEP, {
    onCompleted: () => {
      toast.success(`${step.stepName} updated`);
      onUpdate();
    }
  });

  const handleSave = async (newStatus?: string) => {
    if (!hasPermission) {
      toast.error('You do not have permission to modify this step.');
      return;
    }

    const updatedStatus = newStatus || status;
    await updateStepMutation({
      variables: {
        input: {
          stepId: step.id,
          status: updatedStatus,
          workContent: content,
          workerId: user?.userId || 'SYSTEM'
        }
      }
    });
    if (newStatus) setStatus(newStatus);
  };

  const renderStepSpecificUI = () => {
    if (loading) return (
      <div className="flex items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-md">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Loading Configuration...</span>
        </div>
      </div>
    );
    
    if (!request) return null;

    const commonProps = {
      request,
      onSave: () => handleSave(),
      disabled: !hasPermission
    };

    switch (step.stepName) {
      case 'ReferenceTable':
        return <ReferenceTablePicker {...commonProps} />;
      case 'KeyTableSetup':
        return <KeyTableSetupPicker {...commonProps} />;
      case 'GDSPath':
        return <GdsPathForm {...commonProps} />;
      case 'StreamInfo':
        return <StreamInfoForm {...commonProps} />;
      case 'RequestSubmission':
        return <ApprovalSubmissionForm request={request} onSave={() => handleSave('DONE')} disabled={!hasPermission} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-8 space-y-8 animate-in fade-in zoom-in duration-500 shadow-sm dark:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!hasPermission && (
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center border border-red-200 dark:border-red-900/20 text-red-500">
              <Lock className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">
              {step.stepName}
              {!hasPermission && <span className="ml-2 text-[8px] text-red-500 font-black tracking-widest uppercase">(Read Only)</span>}
            </h3>
            <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 transition-colors">
              Current Status: <span className="text-indigo-600 dark:text-indigo-400">{status}</span>
            </p>
          </div>
        </div>
        
        {hasPermission && (
          <div className="flex gap-2.5">
            {status === 'TODO' && (
              <button 
                onClick={() => handleSave('IN_PROGRESS')}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-md text-[8px] font-black uppercase hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition-all shadow-sm"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Start Work
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button 
                onClick={() => handleSave('DONE')}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-[8px] font-black uppercase hover:bg-emerald-100 dark:hover:bg-emerald-600/20 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Done
              </button>
            )}
            {status === 'DONE' && (
              <button 
                onClick={() => handleSave('IN_PROGRESS')}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-md text-[8px] font-black uppercase hover:bg-amber-100 dark:hover:bg-amber-600/20 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rollback to In Progress
              </button>
            )}
          </div>
        )}
      </div>

      {renderStepSpecificUI()}

      <div className={`space-y-3 ${!hasPermission ? 'opacity-70 grayscale-[0.5]' : ''}`}>
        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1 block transition-colors">
          Work Logs & Results
        </label>
        <div className={`bg-slate-50 dark:bg-slate-950 border-2 ${!hasPermission ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 focus-within:border-indigo-500/30'} rounded-md overflow-hidden transition-all shadow-sm dark:shadow-xl`}>
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent}
            placeholder={hasPermission ? "Document your findings, table mappings, or verification results here..." : "Read only view of work logs."}
            readOnly={!hasPermission}
          />
        </div>
        
        {hasPermission && (
          <div className="flex justify-end pt-2">
            <button 
              onClick={() => handleSave()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
            >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> Save Draft & Sync Work
            </button>
          </div>
        )}
      </div>

      {step.completedAt && (
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-colors">
          <span>Worker: {step.workerId}</span>
          <span>Completed At: {new Date(step.completedAt).toLocaleString()}</span>
        </div>
      )}

      <style>{`
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid var(--ql-border-color); padding: 10px 16px; background: var(--ql-toolbar-bg); transition: all 0.3s; ${!hasPermission ? 'display: none;' : ''} }
        .ql-container.ql-snow { border: none; min-height: 160px; font-size: 13px; font-family: inherit; transition: all 0.3s; }
        .ql-editor { padding: 16px 20px; color: var(--ql-text-color); transition: color 0.3s; }
        
        :root {
          --ql-border-color: #e2e8f0;
          --ql-toolbar-bg: #f8fafc;
          --ql-text-color: #0f172a;
        }
        .dark {
          --ql-border-color: #1e293b;
          --ql-toolbar-bg: #0f172a;
          --ql-text-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

