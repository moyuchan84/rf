import { create } from 'zustand';

interface DashboardState {
  lastRefreshedAt: Date | null;
  setLastRefreshedAt: (date: Date) => void;
  refreshCount: number;
  incrementRefresh: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  lastRefreshedAt: null,
  setLastRefreshedAt: (date) => set({ lastRefreshedAt: date }),
  refreshCount: 0,
  incrementRefresh: () => set((state) => ({ refreshCount: state.refreshCount + 1 })),
}));
