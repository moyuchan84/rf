// src/features/mail/store/useMailStore.ts
import { create } from 'zustand';

interface MailState {
  lastSentSubject: string | null;
  setLastSentSubject: (subject: string) => void;
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
}

export const useMailStore = create<MailState>((set) => ({
  lastSentSubject: null,
  setLastSentSubject: (subject) => set({ lastSentSubject: subject }),
  isSending: false,
  setIsSending: (sending) => set({ isSending: sending }),
}));
