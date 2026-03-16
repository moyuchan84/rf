import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const RootLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Header */}
        <Header 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />

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
