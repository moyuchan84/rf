import React, { useEffect } from 'react';
import { useApprovalPathStore } from '@/features/approval/store/useApprovalPathStore';
import { useUserStore } from '@/features/auth/store/useUserStore';
import { Star, FolderOpen, Loader2, ExternalLink } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { GET_MY_APPROVAL_PATHS } from '@/features/approval/api/approvalQueries';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PathFavoriteManager: React.FC = () => {
  const { loadFavoritePath, loadFavorites, favorites } = useApprovalPathStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  
  const userId = user?.userId || '';

  const { data, loading } = useQuery(GET_MY_APPROVAL_PATHS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only' // Ensure we get fresh data
  }) as { data: any, loading: boolean };

  useEffect(() => {
    if (data?.getMyApprovalPaths) {
      loadFavorites(data.getMyApprovalPaths);
    }
  }, [data, loadFavorites]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Path Favorites
        </h3>
        <button 
          onClick={() => navigate('/approval')}
          className="text-[9px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-tight flex items-center gap-1 transition-colors"
        >
          Manage <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Favorite List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-md text-slate-400 gap-2">
            <FolderOpen className="w-6 h-6 opacity-20" />
            <div className="text-[9px] font-black uppercase tracking-widest text-center">No saved paths found</div>
            <button 
              onClick={() => navigate('/approval')}
              className="mt-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white rounded text-[8px] font-black uppercase transition-all"
            >
              Go Create One
            </button>
          </div>
        ) : (
          favorites.map((fav) => (
            <div
              key={fav.id}
              onClick={() => {
                loadFavoritePath(fav.pathItems);
                toast.success(`'${fav.pathName}' 결재선이 로드되었습니다.`);
              }}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-md hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-sm bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                  <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{fav.pathName}</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fav.pathItems.length} Approvers</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
