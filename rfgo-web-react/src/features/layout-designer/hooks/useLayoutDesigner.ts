import { useLayoutStore } from '../store/useLayoutStore';
import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { SAVE_LAYOUT, UPDATE_LAYOUT, PAGINATED_LAYOUTS } from '../api/layoutQueries';
import { OpencvDetector } from '../utils/OpencvDetector';
import { v4 as uuidv4 } from 'uuid';
import { LayoutService } from '../services/LayoutService';
import toast from 'react-hot-toast';

export const useLayoutDesigner = () => {
  const {
    setCurrentStep, setLaneElements, setPlacements, updatePlacement, setImageUrl
  } = useLayoutStore();

  const [saveLayoutMutation] = useMutation<{ saveLayout: { id: number } }>(SAVE_LAYOUT, {
    refetchQueries: [PAGINATED_LAYOUTS, 'PaginatedLayouts'],
  });
  const [updateLayoutMutation] = useMutation<{ updateLayout: { id: number } }>(UPDATE_LAYOUT, {
    refetchQueries: [PAGINATED_LAYOUTS, 'PaginatedLayouts'],
  });

  const runDetection = useCallback(async (imageSrc: string) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const detectedRects = await OpencvDetector.detect(img);
          if (detectedRects.length > 0) {
            detectedRects.sort((a, b) => (b.width * b.height) - (a.width * a.height));
            const boundaryRect = detectedRects[0];
            const chipsRects = detectedRects.slice(1);
            useLayoutStore.setState({
              boundary: { ...boundaryRect, tag: 'BOUNDARY', visible: true },
              chips: chipsRects.map(c => ({ ...c, tag: 'CHIP', visible: true })),
              laneElements: [] 
            });
          }
        } catch (error) { console.error(error); }
        resolve();
      };
      img.src = imageSrc;
    });
  }, []);

  const analyzeScribelane = useCallback(() => {
    const state = useLayoutStore.getState();
    const { boundary, chips, laneElements: existingLanes } = state;
    if (!boundary?.visible || chips.length === 0) {
      if (existingLanes.length > 0) setLaneElements([]);
      return;
    }
  }, [setLaneElements]);

  const autoArrange = useCallback(() => {
    const { boundary, chips, config } = useLayoutStore.getState();
    if (!boundary) return;

    const activeChips = chips.filter(c => c.visible);
    const targetCount = config.n;
    const elemSize = Math.max(15, Math.min(boundary.width, boundary.height) * 0.03);
    
    // 1. Grid Extraction (All edges)
    const xCoords = Array.from(new Set([
      boundary.x, boundary.x + boundary.width, 
      ...activeChips.flatMap(c => [c.x, c.x + c.width])
    ])).sort((a, b) => a - b);
    
    const yCoords = Array.from(new Set([
      boundary.y, boundary.y + boundary.height, 
      ...activeChips.flatMap(c => [c.y, c.y + c.height])
    ])).sort((a, b) => a - b);

    // 2. Identify Free Slots (Grid Cells)
    const freeCells: { x: number, y: number, w: number, h: number, cx: number, cy: number }[] = [];
    for (let i = 0; i < xCoords.length - 1; i++) {
      for (let j = 0; j < yCoords.length - 1; j++) {
        const w = xCoords[i+1] - xCoords[i];
        const h = yCoords[j+1] - yCoords[j];
        if (w < elemSize * 0.8 || h < elemSize * 0.8) continue; // Too small for a key
        
        const cx = xCoords[i] + w / 2;
        const cy = yCoords[j] + h / 2;
        
        // Check if inside boundary and outside all chips
        const isInsideBoundary = cx >= boundary.x && cx <= boundary.x + boundary.width && 
                                 cy >= boundary.y && cy <= boundary.y + boundary.height;
        const isInsideAnyChip = activeChips.some(c => 
          cx >= c.x - 1 && cx <= c.x + c.width + 1 && 
          cy >= c.y - 1 && cy <= c.y + c.height + 1
        );

        if (isInsideBoundary && !isInsideAnyChip) {
          freeCells.push({ x: xCoords[i], y: yCoords[j], w, h, cx, cy });
        }
      }
    }

    if (freeCells.length === 0) {
      toast.error("No free space found for placement");
      return;
    }

    let selectedPoints: { x: number, y: number }[] = [];

    // 3. Apply Strategy
    if (config.strategy === 'UNIFORM_LINEAR') {
      // Find long streets (horizontal or vertical)
      // For simplicity, pick the largest contiguous set of cells in a row/column
      selectedPoints = freeCells
        .sort((a, b) => (b.w * b.h) - (a.w * a.h)) // Prefer larger areas
        .slice(0, targetCount)
        .map(c => ({ x: c.cx, y: c.cy }));
    } 
    else if (config.strategy === 'GREEDY_GRID') {
      const bx = boundary.x + boundary.width / 2;
      const by = boundary.y + boundary.height / 2;
      const getDist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);

      // Prioritize points near center and corners
      const interestPoints = [
        { x: bx, y: by },
        { x: boundary.x, y: boundary.y },
        { x: boundary.x + boundary.width, y: boundary.y },
        { x: boundary.x, y: boundary.y + boundary.height },
        { x: boundary.x + boundary.width, y: boundary.y + boundary.height }
      ];

      const scoredCells = freeCells.map(cell => {
        const minDist = Math.min(...interestPoints.map(p => getDist({ x: cell.cx, y: cell.cy }, p)));
        return { cell, score: minDist };
      }).sort((a, b) => a.score - b.score);

      selectedPoints = scoredCells.slice(0, targetCount).map(s => ({ x: s.cell.cx, y: s.cell.cy }));
    }
    else { // BEST_FIT_BIN_PACKING or Fallback
      // Just distribute as evenly as possible
      selectedPoints = [];
      const step = Math.max(1, Math.floor(freeCells.length / targetCount));
      for (let i = 0; i < targetCount && i * step < freeCells.length; i++) {
        const c = freeCells[i * step];
        selectedPoints.push({ x: c.cx, y: c.cy });
      }
    }

    // 4. Map to GeometricObjects with tag: 'KEY'
    setPlacements(selectedPoints.map(p => ({
      id: uuidv4(),
      x: p.x - elemSize / 2,
      y: p.y - elemSize / 2,
      width: elemSize, 
      height: elemSize, 
      tag: 'KEY', 
      visible: true, 
      isManual: false
    })));

    toast.success(`Automatically placed ${selectedPoints.length} elements`);
  }, [setPlacements]);

  const saveLayout = async () => {
    const store = useLayoutStore.getState();
    const { id, productId, beolOptionId, processPlanId, stageRef } = store;
    if (!productId) return;
    
    try {
      // Capture Canvas Thumbnail if possible
      let finalImageUrl = store.imageUrl;
      if (stageRef?.current) {
        // High compression for thumbnail
        finalImageUrl = stageRef.current.toDataURL({ pixelRatio: 0.2 });
      }

      const input = {
        ...LayoutService.prepareLayoutInput(store),
        imageUrl: finalImageUrl
      };

      if (id) {
        await updateLayoutMutation({ 
          variables: { 
            id, 
            input: { ...input, id, productId, beolOptionId, processPlanId } 
          },
          onCompleted: () => toast.success('Layout updated successfully!'),
        });
      } else {
        const { data } = await saveLayoutMutation({ 
          variables: { 
            input: { ...input, productId, beolOptionId, processPlanId } 
          },
          onCompleted: () => toast.success('Layout saved successfully!'),
        });
        if (data?.saveLayout?.id) {
          useLayoutStore.setState({ id: data.saveLayout.id });
        }
      }
    } catch (error) { 
      console.error(error); 
      toast.error('Failed to save layout');
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => setImageUrl(event.target?.result as string);
          reader.readAsDataURL(blob);
        }
      }
    }
  }, [setImageUrl]);

  const nextStep = useCallback(async () => {
    const { currentStep, imageUrl } = useLayoutStore.getState();
    if (currentStep === 0 && imageUrl) await runDetection(imageUrl);
    if (currentStep === 1) analyzeScribelane();
    setCurrentStep(Math.min(currentStep + 1, 3));
  }, [runDetection, analyzeScribelane, setCurrentStep]);

  const prevStep = () => {
    const { currentStep } = useLayoutStore.getState();
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  return {
    autoArrange, saveLayout, handlePaste, updatePlacement, nextStep, prevStep, runDetection, analyzeScribelane
  };
};
