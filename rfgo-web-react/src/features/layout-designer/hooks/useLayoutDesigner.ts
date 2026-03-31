import { useLayoutStore, GeometricObject, LaneElement } from '../store/useLayoutStore';
import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { SAVE_LAYOUT, UPDATE_LAYOUT } from '../api/layoutQueries';
import { OpencvDetector } from '../utils/OpencvDetector';
import { v4 as uuidv4 } from 'uuid';
import { LayoutService } from '../services/LayoutService';

export const useLayoutDesigner = () => {
  const {
    id, currentStep, setCurrentStep, imageUrl, boundary, productId, setLaneElements, setPlacements, updatePlacement, setImageUrl
  } = useLayoutStore();

  const [saveLayoutMutation] = useMutation(SAVE_LAYOUT);
  const [updateLayoutMutation] = useMutation(UPDATE_LAYOUT);

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
    
    // 1. Grid Extraction
    const xCoords = Array.from(new Set([boundary.x, boundary.x + boundary.width, ...activeChips.flatMap(c => [c.x, c.x + c.width])])).sort((a, b) => a - b);
    const yCoords = Array.from(new Set([boundary.y, boundary.y + boundary.height, ...activeChips.flatMap(c => [c.y, c.y + c.height])])).sort((a, b) => a - b);

    // 2. Find Free Slots
    const freePoints: { x: number, y: number }[] = [];
    const minSize = 10;
    for (let i = 0; i < xCoords.length - 1; i++) {
      for (let j = 0; j < yCoords.length - 1; j++) {
        const w = xCoords[i+1] - xCoords[i];
        const h = yCoords[j+1] - yCoords[j];
        if (w < minSize && h < minSize) continue;
        
        const cx = xCoords[i] + w / 2;
        const cy = yCoords[j] + h / 2;
        
        const isInsideChip = activeChips.some(c => cx >= c.x - 1 && cx <= c.x + c.width + 1 && cy >= c.y - 1 && cy <= c.y + c.height + 1);
        if (!isInsideChip) freePoints.push({ x: cx, y: cy });
      }
    }

    if (freePoints.length === 0) return;

    // 3. Selection Strategy: Center + 4 Corners
    const finalPoints: { x: number, y: number }[] = [];
    const bx = boundary.x + boundary.width / 2;
    const by = boundary.y + boundary.height / 2;

    const getDist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);

    // 3.1 Pick Center
    const centerPoint = [...freePoints].sort((a, b) => getDist(a, {x:bx, y:by}) - getDist(b, {x:bx, y:by}))[0];
    finalPoints.push(centerPoint);

    // 3.2 Pick Corners
    const cornerTargets = [
      { x: boundary.x, y: boundary.y },
      { x: boundary.x + boundary.width, y: boundary.y },
      { x: boundary.x, y: boundary.y + boundary.height },
      { x: boundary.x + boundary.width, y: boundary.y + boundary.height }
    ];

    cornerTargets.forEach(target => {
      const best = [...freePoints].sort((a, b) => getDist(a, target) - getDist(b, target))[0];
      if (!finalPoints.some(p => p.x === best.x && p.y === best.y)) {
        finalPoints.push(best);
      }
    });

    // 3.3 Pick Remainder by Max-Min distance (Equidistance)
    while (finalPoints.length < Math.min(targetCount, freePoints.length)) {
      let maxMinDist = -1;
      let bestPoint = freePoints[0];

      for (const fp of freePoints) {
        if (finalPoints.some(p => p.x === fp.x && p.y === fp.y)) continue;
        const minDistToExisting = Math.min(...finalPoints.map(p => getDist(fp, p)));
        if (minDistToExisting > maxMinDist) {
          maxMinDist = minDistToExisting;
          bestPoint = fp;
        }
      }
      finalPoints.push(bestPoint);
    }

    // 4. Map to GeometricObjects
    const elemSize = Math.max(15, Math.min(boundary.width, boundary.height) * 0.03);
    setPlacements(finalPoints.slice(0, targetCount).map(p => ({
      id: uuidv4(),
      x: p.x - elemSize / 2,
      y: p.y - elemSize / 2,
      width: elemSize, height: elemSize, tag: 'CHIP', visible: true, isManual: false
    })));
  }, [setPlacements]);

  const saveLayout = async () => {
    const store = useLayoutStore.getState();
    const { id, productId } = store;
    if (!productId) return;
    try {
      const input = LayoutService.prepareLayoutInput(store);
      if (id) {
        await updateLayoutMutation({ variables: { id, input: { ...input, id } } });
        alert('Layout updated successfully!');
      } else {
        await saveLayoutMutation({ variables: { input } });
        alert('Layout saved successfully!');
      }
    } catch (error) { console.error(error); }
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
    const { currentStep, imageUrl, boundary } = useLayoutStore.getState();
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
