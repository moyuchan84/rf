import { create } from 'zustand';
import { type RequestStep } from '../../master-data/types';

interface StepWorkState {
  content: string;
  setContent: (content: string) => void;
  status: string;
  setStatus: (status: string) => void;
  initialize: (step: RequestStep) => void;
}

export const useStepWorkStore = create<StepWorkState>((set) => ({
  content: '',
  setContent: (content) => set({ content }),
  status: '',
  setStatus: (status) => set({ status }),
  initialize: (step) => set({
    content: step.workContent || '',
    status: step.status
  }),
}));
