import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Employee {
  epId: string | null;
  fullName: string | null;
  userId: string | null;
  departmentName: string | null;
  emailAddress: string | null;
}

interface EmployeeState {
  recentSearches: Employee[];
  addRecent: (employee: Employee) => void;
  clearRecents: () => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecent: (employee) => 
        set((state) => ({
          recentSearches: [
            employee,
            ...state.recentSearches.filter((e) => e.userId !== employee.userId),
          ].slice(0, 5),
        })),
      clearRecents: () => set({ recentSearches: [] }),
    }),
    {
      name: 'rfgo-employee-search-storage',
    }
  )
);
