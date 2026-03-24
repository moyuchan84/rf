import { create } from 'zustand';
import { ApprovalPathItem, UserApprovalPath } from '../types';

interface ApprovalPathState {
  currentPath: ApprovalPathItem[];
  favorites: UserApprovalPath[];
  
  // Actions
  loadFavorites: (paths: UserApprovalPath[]) => void;
  loadFavoritePath: (pathItems: ApprovalPathItem[]) => void;
  addApprover: (employee: any, role: string) => void;
  removeApprover: (epId: string) => void;
  updateRole: (epId: string, role: string) => void;
  reorderPath: (startIndex: number, endIndex: number) => void;
  clearPath: () => void;
}

export const useApprovalPathStore = create<ApprovalPathState>((set) => ({
  currentPath: [],
  favorites: [],

  loadFavorites: (favorites) => set({ favorites }),

  loadFavoritePath: (pathItems) => set((state) => {
    const drafter = state.currentPath.find(item => item.role === '0');
    const otherItems = pathItems.filter(item => item.role !== '0');
    
    return {
      currentPath: drafter ? [drafter, ...otherItems] : pathItems
    };
  }),

  addApprover: (employee, role) => set((state) => {
    if (state.currentPath.some(item => item.epId === employee.epId)) return state;
    
    // If adding a drafter, ensure it's at the beginning
    if (role === '0') {
      const others = state.currentPath.filter(item => item.role !== '0');
      return {
        currentPath: [{
          epId: employee.epId,
          userId: employee.userId,
          fullName: employee.fullName,
          email: employee.email,
          role: role,
          aplnStatsCode: '0'
        }, ...others]
      };
    }

    return {
      currentPath: [...state.currentPath, {
        epId: employee.epId,
        userId: employee.userId,
        fullName: employee.fullName,
        email: employee.email,
        role: role,
        aplnStatsCode: '0'
      }]
    };
  }),

  removeApprover: (epId) => set((state) => ({
    currentPath: state.currentPath.filter(item => item.epId !== epId || item.role === '0')
  })),

  updateRole: (epId, role) => set((state) => ({
    currentPath: state.currentPath.map(item => 
      (item.epId === epId && item.role !== '0') ? { ...item, role } : item
    )
  })),

  reorderPath: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.currentPath);
    
    // Don't allow moving the drafter (index 0)
    if (startIndex === 0 || endIndex === 0) return state;

    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { currentPath: result };
  }),

  clearPath: () => set((state) => {
    const drafter = state.currentPath.find(item => item.role === '0');
    return { currentPath: drafter ? [drafter] : [] };
  }),
}));
