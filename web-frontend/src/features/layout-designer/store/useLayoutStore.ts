import { create } from 'zustand';

export interface Point {
  x: number;
  y: number;
}

export interface GeometricObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isManual?: boolean;
  visible?: boolean;
}

export interface Scribelane {
  id: string;
  p1: Point;
  p2: Point;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  visible?: boolean;
}

export interface ShotInfo {
  realW: number;
  realH: number;
  pixelW: number;
  pixelH: number;
}

export interface LayoutConfig {
  n: number;
  strategy: 'GREEDY_GRID' | 'UNIFORM_LINEAR' | 'BEST_FIT_BIN_PACKING';
  defaultFlags: {
    center: boolean;
    corners: boolean;
  };
}

interface LayoutState {
  title: string;
  productId: number | null;
  boundary: GeometricObject | null;
  chips: GeometricObject[];
  scribelanes: Scribelane[];
  placements: GeometricObject[];
  shotInfo: ShotInfo | null;
  config: LayoutConfig;
  scale: number;
  selectedId: string | null;
  imageUrl: string | null;
  currentStep: number;

  // Actions
  setTitle: (title: string) => void;
  setProductId: (id: number | null) => void;
  setBoundary: (boundary: GeometricObject | null) => void;
  setChips: (chips: GeometricObject[]) => void;
  setScribelanes: (scribelanes: Scribelane[]) => void;
  setPlacements: (placements: GeometricObject[]) => void;
  updatePlacement: (id: string, updates: Partial<GeometricObject>) => void;
  setShotInfo: (info: ShotInfo | null) => void;
  setConfig: (config: Partial<LayoutConfig>) => void;
  setScale: (scale: number) => void;
  selectElement: (id: string | null) => void;
  setImageUrl: (url: string | null) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialConfig: LayoutConfig = {
  n: 1,
  strategy: 'UNIFORM_LINEAR',
  defaultFlags: {
    center: true,
    corners: true,
  },
};

export const useLayoutStore = create<LayoutState>((set) => ({
  title: 'Untitled Layout',
  productId: null,
  boundary: null,
  chips: [],
  scribelanes: [],
  placements: [],
  shotInfo: null,
  config: initialConfig,
  scale: 1,
  selectedId: null,
  imageUrl: null,
  currentStep: 0,

  setTitle: (title) => set({ title }),
  setProductId: (productId) => set({ productId }),
  setBoundary: (boundary) => set({ boundary }),
  setChips: (chips) => set({ chips }),
  setScribelanes: (scribelanes) => set({ scribelanes }),
  setPlacements: (placements) => set({ placements }),
  updatePlacement: (id, updates) =>
    set((state) => ({
      placements: state.placements.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  setShotInfo: (info) => set({ shotInfo: info }),
  setConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  setScale: (scale) => set({ scale }),
  selectElement: (id) => set({ selectedId: id }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  reset: () =>
    set({
      title: 'Untitled Layout',
      productId: null,
      boundary: null,
      chips: [],
      scribelanes: [],
      placements: [],
      shotInfo: null,
      config: initialConfig,
      scale: 1,
      selectedId: null,
      imageUrl: null,
      currentStep: 0,
    }),
}));
