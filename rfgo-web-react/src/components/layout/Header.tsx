import React from 'react';
import { Search, Bell, Settings, User, Menu, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../shared/store/useThemeStore';

interface HeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isCollapsed: _isCollapsed, onToggle }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 px-6 border-b border-slate-200/60 dark:border-slate-900 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl z-10 sticky top-0 transition-all">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onToggle}
          className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group shrink-0 shadow-sm"
        >
          <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <input 
            type="text" 
            placeholder="Search data, keys, or requests..."
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
          />
        </div>
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

        <button className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group relative shadow-sm">
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>
        <button className="w-9 h-9 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center transition-all group shadow-sm">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1"></div>
        <button className="w-9 h-9 bg-indigo-600 rounded-md flex items-center justify-center shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
          <User className="text-white w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
