import { create } from 'zustand';
import { RagSearchResult } from '../api/ragApi';

interface RagMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  results?: RagSearchResult[];
  timestamp: Date;
}

interface RagState {
  messages: RagMessage[];
  isLoading: boolean;
  history: string[];
  addMessage: (message: Omit<RagMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useRagStore = create<RagState>((set) => ({
  messages: [],
  isLoading: false,
  history: ["14nm Key Table Summary", "Exynos 2200 vs 2100", "Missing Target List"],
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36), timestamp: new Date() }],
    // Add to history if it's a user query
    history: msg.role === 'user' && !state.history.includes(msg.content) 
      ? [msg.content, ...state.history].slice(0, 5) 
      : state.history
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearChat: () => set({ messages: [] })
}));
