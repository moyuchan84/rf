import { create } from 'zustand';

interface GdsPathState {
  gdsPathList: string[];
  setGdsPathList: (list: string[]) => void;
  addGdsPath: (path: string) => void;
  removeGdsPath: (index: number) => void;
  updateGdsPath: (index: number, path: string) => void;
  reset: () => void;
}

export const useGdsPathStore = create<GdsPathState>((set) => ({
  gdsPathList: [''],
  setGdsPathList: (gdsPathList) => set({ gdsPathList }),
  addGdsPath: (path) => set((state) => ({ gdsPathList: [...state.gdsPathList, path] })),
  removeGdsPath: (index) => set((state) => ({ 
    gdsPathList: state.gdsPathList.filter((_, i) => i !== index) 
  })),
  updateGdsPath: (index, path) => set((state) => ({
    gdsPathList: state.gdsPathList.map((p, i) => i === index ? path : p)
  })),
  reset: () => set({ gdsPathList: [''] }),
}));
