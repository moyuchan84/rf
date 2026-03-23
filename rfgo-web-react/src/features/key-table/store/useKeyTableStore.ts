import { create } from 'zustand';
import { type PhotoKey } from '../../master-data/types';

interface KeyTableState {
  selectedPlanId: number | null;
  selectedOptionId: number | null;
  selectedProductId: number | null;
  selectedKey: PhotoKey | null;
  photoKeys: PhotoKey[];
  
  setSelectedPlanId: (id: number | null) => void;
  setSelectedOptionId: (id: number | null) => void;
  setSelectedProductId: (id: number | null) => void;
  setSelectedKey: (key: PhotoKey | null) => void;
  setPhotoKeys: (keys: PhotoKey[]) => void;
  resetSelection: () => void;
}

export const useKeyTableStore = create<KeyTableState>((set) => ({
  selectedPlanId: null,
  selectedOptionId: null,
  selectedProductId: null,
  selectedKey: null,
  photoKeys: [],

  setSelectedPlanId: (id) => set({ 
    selectedPlanId: id, 
    selectedOptionId: null, 
    selectedProductId: null 
  }),
  setSelectedOptionId: (id) => set({ 
    selectedOptionId: id, 
    selectedProductId: null 
  }),
  setSelectedProductId: (id) => set({ 
    selectedProductId: id 
  }),
  setSelectedKey: (key) => set({ 
    selectedKey: key 
  }),
  setPhotoKeys: (photoKeys) => set({ photoKeys }),
  resetSelection: () => set({ 
    selectedPlanId: null, 
    selectedOptionId: null, 
    selectedProductId: null, 
    selectedKey: null,
    photoKeys: []
  }),
}));
