import { create } from 'zustand';
import type { SelectedNode } from '../types';

interface MasterDataState {
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
}

export const useMasterDataStore = create<MasterDataState>((set) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  isFormOpen: false,
  setIsFormOpen: (open) => set({ isFormOpen: open }),
}));
