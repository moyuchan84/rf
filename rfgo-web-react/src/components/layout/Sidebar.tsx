import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, LogOut, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { navItems, type NavItem } from './navItems';
import { useUserStore } from '@/features/auth/store/useUserStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, role, logout } = useUserStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return role ? (item.roles as any[]).includes(role) : false;
  });

  const renderNavItem = (item: NavItem, isChild = false) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    if (hasChildren && !isCollapsed) {
      return (
        <div key={item.label} className="space-y-0.5">
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all group relative',
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-black' 
                : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-slate-200'
            )}
          >
            <item.icon className={cn('w-4 h-4 transition-transform group-hover:scale-110 shrink-0', isActive ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500')} />
            <span className="text-xs font-bold tracking-tight flex-1 text-left">
              {item.label}
            </span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {isExpanded && (
            <div className="pl-4 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
              {item.children?.map(child => renderNavItem(child as NavItem, true))}
            </div>
          )}
        </div>
      );
    }

    // For items without children OR collapsed sidebar, use Link
    return (
      <Link
        key={item.label}
        to={item.path}
        title={isCollapsed ? item.label : ''}
        className={cn(
          'flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all group relative',
          isActive 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
            : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-slate-200',
          isCollapsed && "justify-center px-0",
          isChild && "py-2"
        )}
      >
        <item.icon className={cn('w-4 h-4 transition-transform group-hover:scale-110 shrink-0', isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400')} />
        {!isCollapsed && (
          <span className={cn(
            "text-xs font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300",
            isChild && "text-[11px]"
          )}>
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={cn(
      "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Sidebar Branding & Toggle */}
      <div className={cn("p-4 flex items-center", isCollapsed ? "flex-col gap-4 py-6" : "justify-between px-6 py-5")}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Layers className="text-white w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">RFGo</h1>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Semiconductor</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={onToggle}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-md transition-all hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400",
            isCollapsed && "mt-2"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {filteredNavItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Sidebar User Profile */}
      <div className={cn("p-3 border-t border-slate-200/60 dark:border-slate-900 transition-all", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn(
          "bg-white dark:bg-slate-900/50 rounded-md border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 transition-all shadow-sm",
          isCollapsed ? "p-1.5 justify-center" : "p-3"
        )}>
          <div className="w-8 h-8 bg-indigo-500/10 rounded-md flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] shrink-0 uppercase">
            {user?.fullName?.substring(0, 2) || '??'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-[10px] font-black text-slate-900 dark:text-slate-200 truncate uppercase tracking-widest">{user?.fullName || 'Guest User'}</p>
              <p className="text-[8px] text-slate-600 font-bold truncate">{user?.email || 'Not logged in'}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={() => logout()}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
