import { create } from 'zustand';
import { PhotoKey } from '@/features/master-data/types';

export type SearchScenario = 'STREAM' | 'PROCESS';

interface ReferenceTableState {
  scenario: SearchScenario;
  setScenario: (scenario: SearchScenario) => void;
  
  // Selection
  selectedTables: PhotoKey[];
  setSelectedTables: (tables: PhotoKey[]) => void;
  addTable: (table: PhotoKey) => void;
  removeTable: (id: number) => void;

  // Search Results
  availableKeys: PhotoKey[];
  setAvailableKeys: (keys: PhotoKey[]) => void;
  
  // Scenario 2 Context
  processPlanId: number | null;
  beolOptionId: number | null;
  productId: number | null;
  setProcessContext: (planId: number | null, optionId: number | null, prodId: number | null) => void;
  
  // Preview
  previewTable: PhotoKey | null;
  setPreviewTable: (table: PhotoKey | null) => void;
  
  reset: () => void;
}

export const useReferenceTableStore = create<ReferenceTableState>((set) => ({
  scenario: 'PROCESS',
  setScenario: (scenario) => set({ scenario }),
  
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
  
  processPlanId: null,
  beolOptionId: null,
  productId: null,
  setProcessContext: (processPlanId, beolOptionId, productId) => set({ 
    processPlanId, beolOptionId, productId 
  }),
  
  previewTable: null,
  setPreviewTable: (previewTable) => set({ previewTable }),

  reset: () => set({
    scenario: 'PROCESS',
    selectedTables: [],
    availableKeys: [],
    processPlanId: null,
    beolOptionId: null,
    productId: null,
    previewTable: null
  }),
}));
