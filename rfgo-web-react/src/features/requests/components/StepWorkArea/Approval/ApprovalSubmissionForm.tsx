import React, { useEffect } from 'react';
import { Send, AlertCircle, FileText, Loader2, Info } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useApprovalPathStore } from '@/features/approval/store/useApprovalPathStore';
import { useSubmitApproval } from '@/features/approval/hooks/useSubmitApproval';
import { ApprovalLineTable } from './ApprovalLineTable';
import { PathFavoriteManager } from './PathFavoriteManager';
import { EmployeeSearch } from '@/features/employee/components/EmployeeSearch';

import { useUserStore } from '@/features/auth/store/useUserStore';

interface ApprovalSubmissionFormProps {
  request: any;
  onSave: () => void;
}

export const ApprovalSubmissionForm: React.FC<ApprovalSubmissionFormProps> = ({ request, onSave }) => {
  const { user } = useUserStore();
  const { addApprover, currentPath } = useApprovalPathStore();
  const { 
    title, setTitle, 
    content, setContent, 
    handleSubmit, loading, 
    canSubmit 
  } = useSubmitApproval(request.id, onSave);

  // 초기 값 설정 및 기안자 자동 등록
  useEffect(() => {
    if (!title) setTitle(`[RFGo] ${request.title} 의뢰 결재 상신`);
    if (!content) setContent(``);

    // 기안자 자동 등록 (결재선이 비어있고 사용자가 로그인된 경우)
    if (user && currentPath.length === 0) {
      addApprover(user, '0');
    }
  }, [request, user, currentPath.length, addApprover]);

  const handleEmployeeSelect = (employee: any) => {
    addApprover(employee, '1');
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 border border-slate-200/60 rounded-md bg-white dark:bg-slate-900/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left: Setup (8 cols) */}
      <div className="col-span-8 space-y-6">
        <header className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-indigo-500 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Approval Submission</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Construct the approval line and draft content</p>
          </div>
        </header>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Approval Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter approval title..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Approval Content
            </label>
            <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md overflow-hidden">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent}
                className="quill-editor"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Info className="w-3 h-3" /> Approval Line
          </label>
          <ApprovalLineTable />
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-md flex gap-3">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold leading-relaxed uppercase tracking-tight">
            상신 버튼을 누르면 내부 시스템과 연동되어 결재가 진행됩니다. 결재가 시작된 후에는 수정이 불가능합니다.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-95 group"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
            {loading ? "Submitting..." : "Submit Approval"}
          </button>
        </div>
      </div>

      {/* Right: Favorites (4 cols) */}
      <div className="col-span-4 space-y-6 border-l border-slate-100 dark:border-slate-800 pl-6">
        <PathFavoriteManager />
      </div>

      <style>{`
        .quill-editor .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          background: #f8fafc;
        }
        .dark .quill-editor .ql-toolbar {
          background: #020617;
          border-bottom-color: #1e293b;
        }
        .quill-editor .ql-container {
          border: none;
          font-family: inherit;
          font-size: 13px;
          min-height: 200px;
        }
        .dark .quill-editor .ql-stroke { stroke: #94a3b8; }
        .dark .quill-editor .ql-fill { fill: #94a3b8; }
        .dark .quill-editor .ql-picker { color: #94a3b8; }
      `}</style>
    </div>
  );
};
