import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2026 RFGo Semiconductor Photo-Key Management System
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase transition-colors">Documentation</a>
            <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase transition-colors">Support</a>
            <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
