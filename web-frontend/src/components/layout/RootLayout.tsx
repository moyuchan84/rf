import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Palette, 
  Table2, 
  Layers, 
  Search,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ClipboardList, label: 'Requests', path: '/requests' },
  { icon: Database, label: 'Master Data', path: '/master-data' },
  { icon: Palette, label: 'Key Design', path: '/key-design' },
  { icon: Table2, label: 'Photo Key Table', path: '/key-table' },
  { icon: Layers, label: 'Key Layout', path: '/layout' },
  { icon: Search, label: 'RAG Search', path: '/rag' },
];

const RootLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter">RFGo</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Semiconductor</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group',
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
                )}
              >
                <item.icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400')} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-900">
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-200 truncate uppercase tracking-widest">Admin User</p>
              <p className="text-[10px] text-slate-500 font-bold truncate">admin@samsung.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Header */}
        <header className="h-24 px-10 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-950/50 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search data, keys, or requests..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button className="w-11 h-11 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center transition-all group relative">
              <Bell className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <button className="w-11 h-11 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center transition-all group">
              <Settings className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
            </button>
            <div className="w-px h-6 bg-slate-800 mx-2"></div>
            <button className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
              <User className="text-white w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
          <div className="p-10 max-w-[1600px] mx-auto w-full min-h-full flex flex-col">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
