import React, { useState } from 'react';
import { Search, Bell, Settings, User, Menu, Sun, Moon, LogOut, Shield } from 'lucide-react';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { useUserStore } from '../../features/auth/store/useUserStore';

interface HeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isCollapsed: _isCollapsed, onToggle }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-200/60 dark:border-slate-900 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl z-30 sticky top-0 transition-all">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onToggle}
          className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group shrink-0 shadow-sm"
        >
          <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>
        
        {/* <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <input 
            type="text" 
            placeholder="Search data, keys, or requests..."
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
          />
        </div> */}
      </div>
      
      <div className="flex items-center gap-3 ml-6">
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

        {/* <button className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group relative shadow-sm">
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>
        <button className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group shadow-sm">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button> */}
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
              
              {/* <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <User className="w-3.5 h-3.5" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Shield className="w-3.5 h-3.5" />
                Security Keys
              </button> */}
              
              {/* <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2"></div> */}
              
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
