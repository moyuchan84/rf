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
    
    // 1. Precise Scribelane Point Extraction
    const xEdges = Array.from(new Set([boundary.x, boundary.x + boundary.width, ...activeChips.flatMap(c => [c.x, c.x + c.width])])).sort((a, b) => a - b);
    const yEdges = Array.from(new Set([boundary.y, boundary.y + boundary.height, ...activeChips.flatMap(c => [c.y, c.y + c.height])])).sort((a, b) => a - b);

    const candidates: { x: number, y: number, area: number }[] = [];
    for (let i = 0; i < xEdges.length - 1; i++) {
      for (let j = 0; j < yEdges.length - 1; j++) {
        const w = xEdges[i+1] - xEdges[i];
        const h = yEdges[j+1] - yEdges[j];
        if (w < elemSize * 0.4 || h < elemSize * 0.4) continue;
        
        const cx = xEdges[i] + w / 2;
        const cy = yEdges[j] + h / 2;
        
        const isInsideChip = activeChips.some(c => 
          cx >= c.x - 0.5 && cx <= c.x + c.width + 0.5 && 
          cy >= c.y - 0.5 && cy <= c.y + c.height + 0.5
        );

        if (!isInsideChip) {
          candidates.push({ x: cx, y: cy, area: w * h });
        }
      }
    }

    if (candidates.length === 0) {
      toast.error("No valid scribelane space found");
      return;
    }

    const getDist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
    const selected: typeof candidates = [];
    let pool = [...candidates];

    const pickNearest = (target: {x:number, y:number}) => {
      if (pool.length === 0 || selected.length >= targetCount) return;
      pool.sort((a, b) => getDist(a, target) - getDist(b, target));
      selected.push(pool[0]);
      pool.splice(0, 1);
    };

    // 2. Mandatory Priority Placement (Top 5)
    
    // 2.1 Absolute Center of Shot Boundary
    pickNearest({ x: boundary.x + boundary.width / 2, y: boundary.y + boundary.height / 2 });

    // 2.2 4 Outermost Corners
    const cornerTargets = [
      { x: boundary.x, y: boundary.y },
      { x: boundary.x + boundary.width, y: boundary.y },
      { x: boundary.x, y: boundary.y + boundary.height },
      { x: boundary.x + boundary.width, y: boundary.y + boundary.height }
    ];
    cornerTargets.forEach(pickNearest);

    // 3. Strategy-based Placement for 6th point onwards
    while (selected.length < targetCount && pool.length > 0) {
      if (config.strategy === 'UNIFORM_LINEAR') {
        // Prefer points aligned with existing X or Y to form lines
        pool.sort((a, b) => {
          const aAlign = Math.min(...selected.map(s => Math.min(Math.abs(s.x - a.x), Math.abs(s.y - a.y))));
          const bAlign = Math.min(...selected.map(s => Math.min(Math.abs(s.x - b.x), Math.abs(s.y - b.y))));
          return aAlign - bAlign;
        });
      } 
      else if (config.strategy === 'BEST_FIT_BIN_PACKING') {
        // Prefer points in largest available gaps
        pool.sort((a, b) => b.area - a.area);
      }
      else { // GREEDY_GRID: Max-Min distance
        pool.sort((a, b) => {
          const aMinD = Math.min(...selected.map(s => getDist(a, s)));
          const bMinD = Math.min(...selected.map(s => getDist(b, s)));
          return bMinD - aMinD; // Descending order of min distance
        });
      }
      
      selected.push(pool[0]);
      pool.splice(0, 1);
    }

    // 4. Update Store
    setPlacements(selected.map(p => ({
      id: uuidv4(),
      x: p.x - elemSize / 2,
      y: p.y - elemSize / 2,
      width: elemSize, height: elemSize, tag: 'KEY', visible: true, isManual: false
    })));

    toast.success(`Arranged ${selected.length} elements using ${config.strategy}`);
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
