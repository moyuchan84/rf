import { create } from 'zustand';

export type RoleName = 'ADMIN' | 'RFG' | 'INNO' | 'USER';

export interface User {
  id: number;
  epId: string;
  userId: string;
  fullName: string;
  deptName: string;
  email: string;
  role: {
    id: number;
    name: RoleName;
  };
}

interface UserState {
  user: User | null;
  role: RoleName | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  hasRole: (requiredRoles: RoleName[]) => boolean;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user, role: user?.role.name || null, isLoading: false }),
  hasRole: (requiredRoles) => {
    const userRole = get().role;
    return userRole ? requiredRoles.includes(userRole) : false;
  },
  logout: () => {
    set({ user: null, role: null });
    // Backend logout logic should clear the HttpOnly cookie
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999'}/auth/logout`;
  },
}));
