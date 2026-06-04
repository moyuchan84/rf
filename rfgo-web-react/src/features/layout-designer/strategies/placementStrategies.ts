import { v4 as uuidv4 } from 'uuid';
import { GeometricObject } from '../store/useLayoutStore';

export interface ElementInput {
  id: string;
  name: string;
  width: number;
  height: number;
  anchor: 'NONE' | 'CENTER' | 'EDGE';
}

export interface Candidate {
  x: number;
  y: number;
  area: number;
}

export interface ArrangeParams {
  boundary: { x: number; y: number; width: number; height: number };
  candidates: Candidate[];
  elements: ElementInput[];
  strategyType: 'UNIFORM_LINEAR' | 'GREEDY_GRID' | 'BEST_FIT_BIN_PACKING';
}

export interface PlacementResult extends GeometricObject {
  name?: string;
}

// Strategy Interface
export interface IPlacementStrategy {
  sortPool(
    pool: Candidate[],
    selected: { candidate: Candidate; element: ElementInput }[],
    getDist: (p1: { x: number; y: number }, p2: { x: number; y: number }) => number
  ): Candidate[];
}

// Concrete Strategy: Uniform Linear
export class UniformLinearStrategy implements IPlacementStrategy {
  sortPool(
    pool: Candidate[],
    selected: { candidate: Candidate; element: ElementInput }[],
    getDist: (p1: { x: number; y: number }, p2: { x: number; y: number }) => number
  ): Candidate[] {
    if (selected.length === 0) return pool;
    return [...pool].sort((a, b) => {
      const aAlign = Math.min(...selected.map(s => Math.min(Math.abs(s.candidate.x - a.x), Math.abs(s.candidate.y - a.y))));
      const bAlign = Math.min(...selected.map(s => Math.min(Math.abs(s.candidate.x - b.x), Math.abs(s.candidate.y - b.y))));
      return aAlign - bAlign;
    });
  }
}

// Concrete Strategy: Greedy Grid (Max-Min Distance)
export class GreedyGridStrategy implements IPlacementStrategy {
  sortPool(
    pool: Candidate[],
    selected: { candidate: Candidate; element: ElementInput }[],
    getDist: (p1: { x: number; y: number }, p2: { x: number; y: number }) => number
  ): Candidate[] {
    if (selected.length === 0) return pool;
    return [...pool].sort((a, b) => {
      const aMinD = Math.min(...selected.map(s => getDist(a, s.candidate)));
      const bMinD = Math.min(...selected.map(s => getDist(b, s.candidate)));
      return bMinD - aMinD; // Descending order of minimum distance
    });
  }
}

// Concrete Strategy: Best Fit (Largest Area)
export class BestFitBinPackingStrategy implements IPlacementStrategy {
  sortPool(
    pool: Candidate[],
    selected: { candidate: Candidate; element: ElementInput }[],
    getDist: (p1: { x: number; y: number }, p2: { x: number; y: number }) => number
  ): Candidate[] {
    return [...pool].sort((a, b) => b.area - a.area);
  }
}

// Strategy Context / Engine
export class PlacementEngine {
  private static strategies: Record<ArrangeParams['strategyType'], IPlacementStrategy> = {
    UNIFORM_LINEAR: new UniformLinearStrategy(),
    GREEDY_GRID: new GreedyGridStrategy(),
    BEST_FIT_BIN_PACKING: new BestFitBinPackingStrategy(),
  };

  private static getDist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  public static arrange(params: ArrangeParams): PlacementResult[] {
    const { boundary, candidates, elements, strategyType } = params;
    const pool = [...candidates];
    const selected: { candidate: Candidate; element: ElementInput }[] = [];
    const strategy = this.strategies[strategyType] || this.strategies.UNIFORM_LINEAR;

    const pickNearestForElement = (target: { x: number; y: number }, element: ElementInput) => {
      if (pool.length === 0) return;
      pool.sort((a, b) => this.getDist(a, target) - this.getDist(b, target));
      selected.push({ candidate: pool[0], element });
      pool.splice(0, 1);
    };

    // 1. Process Explicit Anchors
    const hasExplicitAnchors = elements.some(el => el.anchor !== 'NONE');

    if (hasExplicitAnchors) {
      const centerElements = elements.filter(el => el.anchor === 'CENTER');
      const edgeElements = elements.filter(el => el.anchor === 'EDGE');
      const freeElements = elements.filter(el => el.anchor === 'NONE');

      // Place Center elements
      centerElements.forEach(el => {
        const target = { x: boundary.x + boundary.width / 2, y: boundary.y + boundary.height / 2 };
        pickNearestForElement(target, el);
      });

      // Place Edge elements distributed across the 4 corners
      const cornerTargets = [
        { x: boundary.x, y: boundary.y },
        { x: boundary.x + boundary.width, y: boundary.y },
        { x: boundary.x, y: boundary.y + boundary.height },
        { x: boundary.x + boundary.width, y: boundary.y + boundary.height }
      ];
      edgeElements.forEach((el, idx) => {
        const target = cornerTargets[idx % cornerTargets.length];
        pickNearestForElement(target, el);
      });

      // Free elements placed second using the strategy
      freeElements.forEach(el => {
        if (pool.length === 0) return;
        const sortedPool = strategy.sortPool(pool, selected, this.getDist);
        selected.push({ candidate: sortedPool[0], element: el });
        
        // Remove the selected candidate from the original pool
        const idx = pool.findIndex(c => c.x === sortedPool[0].x && c.y === sortedPool[0].y);
        if (idx !== -1) pool.splice(idx, 1);
      });
    } else {
      // Default flow: Center, 4 Corners, then strategy
      const elementsToPlace = [...elements];

      // Center
      if (elementsToPlace.length > 0) {
        const el = elementsToPlace.shift()!;
        pickNearestForElement(
          { x: boundary.x + boundary.width / 2, y: boundary.y + boundary.height / 2 },
          el
        );
      }

      // Corners
      const cornerTargets = [
        { x: boundary.x, y: boundary.y },
        { x: boundary.x + boundary.width, y: boundary.y },
        { x: boundary.x, y: boundary.y + boundary.height },
        { x: boundary.x + boundary.width, y: boundary.y + boundary.height }
      ];

      for (let i = 0; i < cornerTargets.length; i++) {
        if (elementsToPlace.length === 0) break;
        const el = elementsToPlace.shift()!;
        pickNearestForElement(cornerTargets[i], el);
      }

      // Strategy for remaining
      while (elementsToPlace.length > 0 && pool.length > 0) {
        const el = elementsToPlace.shift()!;
        const sortedPool = strategy.sortPool(pool, selected, this.getDist);
        selected.push({ candidate: sortedPool[0], element: el });

        const idx = pool.findIndex(c => c.x === sortedPool[0].x && c.y === sortedPool[0].y);
        if (idx !== -1) pool.splice(idx, 1);
      }
    }

    // Map to final placements
    return selected.map(s => ({
      id: s.element.id || uuidv4(),
      x: s.candidate.x - s.element.width / 2,
      y: s.candidate.y - s.element.height / 2,
      width: s.element.width,
      height: s.element.height,
      tag: 'KEY' as const,
      visible: true,
      isManual: false,
      name: s.element.name,
    }));
  }
}
