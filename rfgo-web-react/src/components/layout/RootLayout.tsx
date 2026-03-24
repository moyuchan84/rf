import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoginRequired from '../../features/auth/components/LoginRequired';

const RootLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loading, login } = useAuth();

  // Responsive handling: Collapse on small screens (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">인증 정보 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginRequired onLogin={login} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
        {/* Header */}
        <Header />
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
          <div className="p-6 max-w-[1600px] mx-auto w-full min-h-full flex flex-col">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
