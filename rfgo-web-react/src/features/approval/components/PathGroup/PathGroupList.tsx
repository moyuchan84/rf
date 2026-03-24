import React from 'react';
import { UserApprovalPath } from '../../types';
import { ShieldCheck } from 'lucide-react';
import { PathGroupCard } from './PathGroupCard';

interface PathGroupListProps {
  favorites: UserApprovalPath[];
  loading: boolean;
  onEdit: (path: UserApprovalPath) => void;
  onDelete: (id: number) => void;
}

export const PathGroupList: React.FC<PathGroupListProps> = ({ favorites, loading, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {loading ? (
        [1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-48 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-md border border-slate-200/60 dark:border-slate-800" />
        ))
      ) : favorites.length > 0 ? (
        favorites.map((path) => (
          <PathGroupCard 
            key={path.id} 
            path={path} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))
      ) : (
        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/30 dark:bg-slate-900/10">
          <ShieldCheck className="w-8 h-8 text-slate-200 dark:text-slate-800 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">등록된 결재선 템플릿이 없습니다.</p>
          <p className="text-[9px] text-slate-300 mt-1 italic">자주 사용하는 결재 경로를 등록해 보세요.</p>
        </div>
      )}
    </div>
  );
};
