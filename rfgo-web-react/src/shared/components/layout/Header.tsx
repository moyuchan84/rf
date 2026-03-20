import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, FileText, Search } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/requests', label: 'Requests', icon: <FileText size={18} /> },
    { path: '/inventory', label: 'Inventory', icon: <Database size={18} /> },
    { path: '/rag', label: 'RAG Search', icon: <Search size={18} /> },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Database className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">RFGo Web</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-1 pt-1 text-sm font-bold border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Admin</button>
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500">JD</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
