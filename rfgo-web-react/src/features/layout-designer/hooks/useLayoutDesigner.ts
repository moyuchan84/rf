import { useLayoutStore, GeometricObject, LaneElement } from '../store/useLayoutStore';
import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { SAVE_LAYOUT } from '../api/layoutQueries';
import { OpencvDetector } from '../utils/OpencvDetector';
import { v4 as uuidv4 } from 'uuid';

export const useLayoutDesigner = () => {
  const {
    boundary, chips, laneElements, placements, shotInfo, config, imageUrl,
    currentStep, setCurrentStep, productId, title, setLaneElements, setPlacements, updatePlacement, setImageUrl
  } = useLayoutStore();

  const [saveLayoutMutation] = useMutation(SAVE_LAYOUT);

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
              laneElements: [] // Reset lanes on new detection
            });
          }
        } catch (error) { console.error(error); }
        resolve();
      };
      img.src = imageSrc;
    });
  }, []);

  const analyzeScribelane = useCallback(() => {
    // Only use VISIBLE boundary and chips
    const activeBoundary = boundary?.visible ? boundary : null;
    const activeChips = chips.filter(c => c.visible);

    if (!activeBoundary || activeChips.length === 0) {
      setLaneElements([]);
      return;
    }

    const newLanes: LaneElement[] = [];
    const threshold = activeBoundary.height * 0.02;

    // Center-line calculation for gaps
    activeChips.forEach((c1, i) => {
      // 1. Check neighboring chips for horizontal corridors
      activeChips.slice(i + 1).forEach(c2 => {
        const isAlignedVertically = Math.abs(c1.y - c2.y) < threshold || Math.abs((c1.y + c1.height) - (c2.y + c2.height)) < threshold;
        if (isAlignedVertically) {
          const startX = Math.min(c1.x + c1.width, c2.x + c2.width);
          const endX = Math.max(c1.x, c2.x);
          if (Math.abs(startX - endX) > 5) {
            newLanes.push({
              id: uuidv4(),
              p1: { x: startX, y: (c1.y + c1.height / 2 + c2.y + c2.height / 2) / 2 },
              p2: { x: endX, y: (c1.y + c1.height / 2 + c2.y + c2.height / 2) / 2 },
              visible: true
            });
          }
        }
      });

      // 2. Connector to boundary (Left/Right)
      newLanes.push({
        id: uuidv4(),
        p1: { x: activeBoundary.x, y: c1.y + c1.height / 2 },
        p2: { x: c1.x, y: c1.y + c1.height / 2 },
        visible: true
      });
      newLanes.push({
        id: uuidv4(),
        p1: { x: c1.x + c1.width, y: c1.y + c1.height / 2 },
        p2: { x: activeBoundary.x + activeBoundary.width, y: c1.y + c1.height / 2 },
        visible: true
      });
    });

    setLaneElements(newLanes);
  }, [boundary, chips, setLaneElements]);

  const autoArrange = useCallback(() => {
    if (!boundary || !shotInfo) return;
    const scaleX = boundary.width / shotInfo.realW;
    const scaleY = boundary.height / shotInfo.realH;
    const newPlacements: GeometricObject[] = [];
    if (config.defaultFlags.center) {
      newPlacements.push({
        id: `placement-center`,
        x: boundary.x + boundary.width / 2 - (10 * scaleX) / 2,
        y: boundary.y + boundary.height / 2 - (10 * scaleY) / 2,
        width: 10 * scaleX, height: 10 * scaleY, tag: 'CHIP', visible: true
      });
    }
    setPlacements(newPlacements);
  }, [boundary, shotInfo, config, setPlacements]);

  const saveLayout = async () => {
    if (!productId) return;
    try {
      await saveLayoutMutation({
        variables: {
          input: {
            title, productId, boundary, chips,
            scribelanes: laneElements, placements, shotInfo, config, imageUrl
          },
        },
      });
      alert('Layout saved successfully!');
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
    if (currentStep === 0 && imageUrl) await runDetection(imageUrl);
    if (currentStep === 1) analyzeScribelane();
    setCurrentStep(Math.min(currentStep + 1, 3));
  }, [currentStep, imageUrl, runDetection, analyzeScribelane, setCurrentStep]);

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  return {
    autoArrange, saveLayout, handlePaste, updatePlacement, nextStep, prevStep, runDetection, analyzeScribelane
  };
};
