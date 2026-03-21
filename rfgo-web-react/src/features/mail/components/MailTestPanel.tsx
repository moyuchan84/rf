// src/features/mail/components/MailTestPanel.tsx
import React, { useState } from 'react';
import { useSendMail } from '../hooks/useSendMail';
import { useMailStore } from '../store/useMailStore';

export const MailTestPanel: React.FC = () => {
  const [email, setEmail] = useState('');
  const { sendTestMail, isSending } = useSendMail();
  const lastSentSubject = useMailStore((state) => state.lastSentSubject);

  return (
    <div className="p-6 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <span className="material-symbols-outlined text-blue-400">mail</span>
        </div>
        <h2 className="text-lg font-black text-white uppercase tracking-tight">Mail Service Test</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
            Recipient Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@samsung.com"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        <button
          onClick={() => sendTestMail(email)}
          disabled={isSending || !email}
          className={`w-full py-4 rounded-xl text-xs font-black tracking-widest transition-all active:scale-95 ${
            isSending || !email
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isSending ? 'SENDING...' : 'SEND TEST MAIL'}
        </button>

        {lastSentSubject && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-[10px] text-emerald-400 font-bold uppercase">Last Sent:</p>
            <p className="text-xs text-slate-300 mt-1 truncate">{lastSentSubject}</p>
          </div>
        )}
      </div>
    </div>
  );
};
