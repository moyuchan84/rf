import React from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';

interface LoginRequiredProps {
  onLogin: () => void;
}

const LoginRequired: React.FC<LoginRequiredProps> = ({ onLogin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-50 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800 group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">RFGo System</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            사내 SSO 인증이 필요한 시스템입니다.<br />계정 정보 확인을 위해 로그인을 진행해 주세요.
          </p>
          
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 dark:shadow-blue-900/20"
          >
            <LogIn className="w-5 h-5" />
            SSO 로그인
          </button>
          
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Platform</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Internal SSO</span>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Security</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">OAuth 2.0 / JWT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;
