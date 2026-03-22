// rfgo-web-react/src/features/mailing/store/useMailSelectorStore.ts
import { create } from 'zustand';

export interface EmployeeDto {
  epId?: string | null;
  fullName?: string | null;
  userId?: string | null;
  departmentName?: string | null;
  emailAddress?: string | null;
  addedAt?: string; // Audit: when added
  isMute?: boolean; // UI: toggle notifications
}

export interface UserMailGroup {
  id: number;
  groupName: string;
  members: EmployeeDto[];
}

interface MailSelectorState {
  // Current Selections for Request Creation
  selectedGroupIds: number[];
  manualRecipients: EmployeeDto[];
  
  // Actions
  toggleGroup: (groupId: number) => void;
  addManualRecipient: (emp: EmployeeDto) => void;
  removeManualRecipient: (idOrEmail: string) => void;
  reset: () => void;
}

export const useMailSelectorStore = create<MailSelectorState>((set) => ({
  selectedGroupIds: [],
  manualRecipients: [],

  toggleGroup: (groupId) => set((state) => ({
    selectedGroupIds: state.selectedGroupIds.includes(groupId)
      ? state.selectedGroupIds.filter(id => id !== groupId)
      : [...state.selectedGroupIds, groupId]
  })),

  addManualRecipient: (emp) => set((state) => {
    const id = emp.userId || emp.epId || emp.emailAddress;
    const alreadyExists = state.manualRecipients.some(
      r => (r.userId || r.epId || r.emailAddress) === id
    );
    if (alreadyExists) return state;
    
    return { 
      manualRecipients: [...state.manualRecipients, { ...emp, addedAt: new Date().toISOString() }] 
    };
  }),

  removeManualRecipient: (idOrEmail) => set((state) => ({
    manualRecipients: state.manualRecipients.filter(
      r => (r.userId !== idOrEmail && r.epId !== idOrEmail && r.emailAddress !== idOrEmail)
    )
  })),

  reset: () => set({ selectedGroupIds: [], manualRecipients: [] }),
}));
