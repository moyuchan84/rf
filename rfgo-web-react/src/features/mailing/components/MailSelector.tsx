// rfgo-web-react/src/features/mailing/components/MailSelector.tsx
import React from 'react';
import { useMailSelectorStore, UserMailGroup } from '../store/useMailSelectorStore';
import { useMailingGroups } from '../hooks/useMailingGroups';
import { EmployeeSearch } from '../../employee/components/EmployeeSearch';
import { User, Users, X, Info, Plus } from 'lucide-react';

export const MailSelector: React.FC = () => {
  const { groups, loading } = useMailingGroups();
  const { 
    selectedGroupIds, 
    manualRecipients, 
    toggleGroup, 
    addManualRecipient, 
    removeManualRecipient 
  } = useMailSelectorStore();

  return (
    <div className="flex flex-col gap-4 border border-slate-200 dark:border-slate-800 rounded-sm p-4 bg-white dark:bg-slate-950 shadow-sm transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> 메일 수신처 설정
        </h3>
        <span className="text-[10px] font-bold text-slate-400 italic">
          * 시스템 기본 수신처 자동 포함
        </span>
      </div>
      
      {/* 1. 개인 즐겨찾기 그룹 섹션 */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">내 그룹 선택</p>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-sm" />
          ) : groups.length > 0 ? (
            groups.map((group: UserMailGroup) => (
              <button
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`px-3 py-1.5 text-[10px] font-bold border rounded-sm transition-all flex items-center gap-2 shadow-sm ${
                  selectedGroupIds.includes(group.id) 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedGroupIds.includes(group.id) ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                {group.groupName} ({group.members.length})
              </button>
            ))
          ) : (
            <p className="text-[10px] text-slate-400 italic">등록된 그룹이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 2. 추가 인원 검색 */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">추가 수신인</p>
        <EmployeeSearch 
          onSelect={(emp) => addManualRecipient(emp)} 
          placeholder="이름/사번/부서로 추가 검색..."
          className="w-full"
        />
        
        {/* 선택된 추가 인원 Chip List */}
        {manualRecipients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-dashed border-slate-200 dark:border-slate-800">
            {manualRecipients.map((emp) => (
              <div 
                key={emp.userId || emp.emailAddress}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-sm shadow-sm animate-in zoom-in-95 duration-200"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">{emp.fullName}</span>
                  <span className="text-[8px] font-bold text-slate-400 leading-none">{emp.departmentName}</span>
                </div>
                <button 
                  onClick={() => removeManualRecipient(emp.userId || emp.emailAddress || '')}
                  className="p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
                >
                  <X className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-1 flex items-start gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-sm">
        <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/60 leading-normal font-medium italic">
          의뢰 시 선택된 그룹 멤버와 추가 인원이 <b>Watcher(수신처)</b>로 등록되며, <br/>
          공정팀 담당자 등 시스템 기본 수신처는 설정과 관계없이 항상 포함됩니다.
        </p>
      </div>
    </div>
  );
};
