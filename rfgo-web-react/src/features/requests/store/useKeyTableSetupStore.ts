import { create } from 'zustand';
import { PhotoKey } from '@/features/master-data/types';

interface KeyTableSetupState {
  // Selection
  selectedTables: PhotoKey[];
  setSelectedTables: (tables: PhotoKey[]) => void;
  addTable: (table: PhotoKey) => void;
  removeTable: (id: number) => void;

  // Search Results
  availableKeys: PhotoKey[];
  setAvailableKeys: (keys: PhotoKey[]) => void;
  
  // Preview
  previewTable: PhotoKey | null;
  setPreviewTable: (table: PhotoKey | null) => void;
  
  reset: () => void;
}

export const useKeyTableSetupStore = create<KeyTableSetupState>((set) => ({
  selectedTables: [],
  setSelectedTables: (tables) => set({ selectedTables: tables }),
  addTable: (table) => set((state) => ({ 
    selectedTables: state.selectedTables.some(t => t.id === table.id) 
      ? state.selectedTables 
      : [...state.selectedTables, table] 
  })),
  removeTable: (id) => set((state) => ({ 
    selectedTables: state.selectedTables.filter(t => t.id !== id) 
  })),

  availableKeys: [],
  setAvailableKeys: (availableKeys) => set({ availableKeys }),
  
  previewTable: null,
  setPreviewTable: (previewTable) => set({ previewTable }),

  reset: () => set({
    selectedTables: [],
    availableKeys: [],
    previewTable: null
  }),
}));
