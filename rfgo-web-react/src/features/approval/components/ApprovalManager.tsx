import React from 'react';
import { EmployeeSearch } from '../../employee/components/EmployeeSearch';
import { ApprovalLineTable } from '../../requests/components/StepWorkArea/Approval/ApprovalLineTable';
import { PathFavoriteManager } from '../../requests/components/StepWorkArea/Approval/PathFavoriteManager';
import { useApprovalPathStore } from '../store/useApprovalPathStore';
import { Send, FileText, AlertCircle } from 'lucide-react';

export const ApprovalManager: React.FC = () => {
  const { currentPath, addApprover } = useApprovalPathStore();

  const handleEmployeeSelect = (employee: any) => {
    // Default to '1' (결재) for new additions
    addApprover(employee, '1');
  };

  const handleSubmitApproval = () => {
    if (currentPath.length === 0) return;
    // Logic to open MemoPreview and then submit
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full overflow-hidden p-6">
      {/* Left: Path Construction (8 columns) */}
      <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">결재선 구성</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memo Approval Line Setup</p>
            </div>
          </div>
        </header>

        {/* Approval Line Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Path</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-slate-500">기안/결재/합의 순서 확인</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <ApprovalLineTable />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-4">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            상신 버튼을 누르면 내부 시스템과 연동되어 결재가 진행됩니다.<br />
            결재가 시작된 후에는 의뢰서 내용을 수정할 수 없으니 신중히 검토해 주세요.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="shrink-0 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            취소
          </button>
          <button
            onClick={handleSubmitApproval}
            disabled={currentPath.length === 0}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> 결재 상신
          </button>
        </div>
      </div>

      {/* Right: Search & Favorites (4 columns) */}
      <div className="col-span-4 flex flex-col gap-6 overflow-hidden border-l border-slate-100 pl-6">
        <div className="flex flex-col gap-4 overflow-hidden h-1/2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            인명 검색
          </h3>
          <div className="flex-1 overflow-hidden flex flex-col">
            <EmployeeSearch onSelect={handleEmployeeSelect} />
          </div>
        </div>

        <div className="h-1/2 overflow-hidden flex flex-col">
          <PathFavoriteManager />
        </div>
      </div>
    </div>
  );
};
