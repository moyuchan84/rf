import React, { useState } from 'react';
import { User, Sun, Moon, LogOut } from 'lucide-react';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useUserStore } from '../../features/auth/store/useUserStore';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-200/60 dark:border-slate-900 flex items-center justify-end shrink-0 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl z-30 sticky top-0 transition-all">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group shrink-0 shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
          )}
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></div>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <User className="text-white w-4 h-4" />
            </div>
            <div className="flex flex-col items-start min-w-[60px]">
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 leading-none mb-0.5">{user?.fullName || 'Guest'}</span>
              <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter leading-none">{user?.role.name || 'USER'}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium truncate">{user?.email}</p>
              </div>
              
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
