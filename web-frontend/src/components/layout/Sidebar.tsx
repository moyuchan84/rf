import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { navItems } from './navItems';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  return (
    <aside className={cn(
      "bg-slate-950 border-r border-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Sidebar Branding */}
      <div className={cn("p-8", isCollapsed ? "px-5" : "p-8")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Layers className="text-white w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-xl font-black text-white tracking-tighter">RFGo</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Semiconductor</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative',
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200',
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn('w-5 h-5 transition-transform group-hover:scale-110 shrink-0', isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400')} />
              {!isCollapsed && (
                <span className="text-sm font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar User Profile */}
      <div className={cn("p-4 border-t border-slate-900 transition-all", isCollapsed ? "p-2" : "p-6")}>
        <div className={cn(
          "bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all",
          isCollapsed ? "p-2 justify-center" : "p-4"
        )}>
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black text-xs shrink-0">
            AD
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-xs font-black text-slate-200 truncate uppercase tracking-widest">Admin User</p>
              <p className="text-[10px] text-slate-500 font-bold truncate">admin@samsung.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
