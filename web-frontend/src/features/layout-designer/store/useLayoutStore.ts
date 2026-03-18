import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

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
  visible: boolean; // 필수 속성으로 변경
  tag: 'BOUNDARY' | 'CHIP';
}

export interface LaneElement {
  id: string;
  p1: Point;
  p2: Point;
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
  laneElements: LaneElement[];
  placements: GeometricObject[];
  shotInfo: ShotInfo | null;
  config: LayoutConfig;
  selectedId: string | null; // 하이라이트용
  imageUrl: string | null;
  currentStep: number;
  isAddMode: boolean;

  // Actions
  setTitle: (title: string) => void;
  setProductId: (id: number | null) => void;
  setBoundary: (boundary: GeometricObject | null) => void;
  setChips: (chips: GeometricObject[]) => void;
  addChip: (chip: Omit<GeometricObject, 'id' | 'tag' | 'visible'>) => void;
  removeChip: (id: string) => void;
  toggleRole: (id: string) => void;
  setLaneElements: (elements: LaneElement[]) => void;
  setPlacements: (placements: GeometricObject[]) => void;
  updatePlacement: (id: string, updates: Partial<GeometricObject>) => void;
  setShotInfo: (info: ShotInfo | null) => void;
  setConfig: (config: Partial<LayoutConfig>) => void;
  selectElement: (id: string | null) => void;
  setImageUrl: (url: string | null) => void;
  setCurrentStep: (step: number) => void;
  setAddMode: (isAddMode: boolean) => void;
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
  laneElements: [],
  placements: [],
  shotInfo: null,
  config: initialConfig,
  selectedId: null,
  imageUrl: null,
  currentStep: 0,
  isAddMode: false,

  setTitle: (title) => set({ title }),
  setProductId: (productId) => set({ productId }),
  setBoundary: (boundary) => set({ boundary: boundary ? { ...boundary, tag: 'BOUNDARY', visible: boundary.visible ?? true } : null }),
  setChips: (chips) => set({ chips: chips.map(c => ({ ...c, tag: 'CHIP', visible: c.visible ?? true })) }),
  addChip: (chip) => set((state) => ({ 
    chips: [...state.chips, { ...chip, id: uuidv4(), tag: 'CHIP', visible: true, isManual: true }] 
  })),
  removeChip: (id) => set((state) => ({ 
    chips: state.chips.filter(c => c.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),
  toggleRole: (id) => set((state) => {
    if (state.boundary?.id === id) {
      return { boundary: null, chips: [...state.chips, { ...state.boundary, tag: 'CHIP' }] };
    }
    const chipToMove = state.chips.find(c => c.id === id);
    if (chipToMove) {
      const oldBoundaryAsChip = state.boundary ? [{ ...state.boundary, tag: 'CHIP' as const }] : [];
      return {
        boundary: { ...chipToMove, tag: 'BOUNDARY' },
        chips: [...state.chips.filter(c => c.id !== id), ...oldBoundaryAsChip]
      };
    }
    return state;
  }),
  setLaneElements: (laneElements) => set({ laneElements }),
  setPlacements: (placements) => set({ placements }),
  updatePlacement: (id, updates) =>
    set((state) => ({
      placements: state.placements.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  setShotInfo: (info) => set({ shotInfo: info }),
  setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
  selectElement: (selectedId) => set({ selectedId }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setAddMode: (isAddMode) => set({ isAddMode }),
  reset: () => set({
    title: 'Untitled Layout', productId: null, boundary: null, chips: [], laneElements: [], 
    placements: [], shotInfo: null, config: initialConfig, selectedId: null, 
    imageUrl: null, currentStep: 0, isAddMode: false,
  }),
}));
