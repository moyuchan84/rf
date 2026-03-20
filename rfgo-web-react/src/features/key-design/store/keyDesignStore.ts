import { create } from 'zustand';
import { KeyDesign } from '../types';

interface KeyDesignState {
  keyDesigns: KeyDesign[];
  selectedDesign: KeyDesign | null;
  isModalOpen: boolean;
  modalType: 'CREATE' | 'UPDATE' | 'VIEW' | null;
  
  setKeyDesigns: (designs: KeyDesign[]) => void;
  setSelectedDesign: (design: KeyDesign | null) => void;
  openCreateModal: () => void;
  openUpdateModal: (design: KeyDesign) => void;
  openViewModal: (design: KeyDesign) => void;
  closeModal: () => void;
}

export const useKeyDesignStore = create<KeyDesignState>((set) => ({
  keyDesigns: [],
  selectedDesign: null,
  isModalOpen: false,
  modalType: null,

  setKeyDesigns: (keyDesigns) => set({ keyDesigns }),
  setSelectedDesign: (selectedDesign) => set({ selectedDesign }),
  openCreateModal: () => set({ isModalOpen: true, modalType: 'CREATE', selectedDesign: null }),
  openUpdateModal: (design) => set({ isModalOpen: true, modalType: 'UPDATE', selectedDesign: design }),
  openViewModal: (design) => set({ isModalOpen: true, modalType: 'VIEW', selectedDesign: design }),
  closeModal: () => set({ isModalOpen: false, modalType: null, selectedDesign: null }),
}));
