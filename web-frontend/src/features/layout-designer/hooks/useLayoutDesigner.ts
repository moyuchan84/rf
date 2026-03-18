import { useLayoutStore, GeometricObject } from '../store/useLayoutStore';
import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { SAVE_LAYOUT } from '../api/layoutQueries';
import { OpencvDetector } from '../utils/OpencvDetector';

export const useLayoutDesigner = () => {
  const {
    boundary,
    chips,
    scribelanes,
    placements,
    shotInfo,
    config,
    setPlacements,
    updatePlacement,
    imageUrl,
    setImageUrl,
    currentStep,
    setCurrentStep,
    productId,
    title,
  } = useLayoutStore();

  const [saveLayoutMutation] = useMutation(SAVE_LAYOUT);

  const runDetection = useCallback(async (imageSrc: string) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const detectedRects = await OpencvDetector.detect(img);
          console.log('[OpenCV] Detection finished:', detectedRects.length, 'objects');
          
          if (detectedRects.length > 0) {
            detectedRects.sort((a, b) => (b.width * b.height) - (a.width * a.height));
            
            const boundaryRect = detectedRects[0];
            const chipsRects = detectedRects.slice(1);
            
            console.log('[Designer] Setting state - Boundary:', boundaryRect.id, 'Chips:', chipsRects.length);
            
            // Atomic update to prevent partial states
            useLayoutStore.setState({
              boundary: boundaryRect,
              chips: chipsRects
            });
          }
        } catch (error) {
          console.error('Detection failed:', error);
        }
        resolve();
      };
      img.src = imageSrc;
    });
  }, []);

  const calculateScaling = useCallback(() => {
    if (!boundary || !shotInfo) return { scaleX: 1, scaleY: 1 };
    const scaleX = boundary.width / shotInfo.realW;
    const scaleY = boundary.height / shotInfo.realH;
    return { scaleX, scaleY };
  }, [boundary, shotInfo]);

  const autoArrange = useCallback(() => {
    if (!boundary || !shotInfo) return;

    const { scaleX, scaleY } = calculateScaling();
    const newPlacements: GeometricObject[] = [];

    if (config.defaultFlags.center) {
      newPlacements.push({
        id: `placement-center`,
        x: boundary.x + boundary.width / 2 - (10 * scaleX) / 2,
        y: boundary.y + boundary.height / 2 - (10 * scaleY) / 2,
        width: 10 * scaleX,
        height: 10 * scaleY,
      });
    }

    if (config.defaultFlags.corners) {
      const padding = 5;
      const cornerPositions = [
        { x: boundary.x + padding, y: boundary.y + padding },
        { x: boundary.x + boundary.width - 10 * scaleX - padding, y: boundary.y + padding },
        { x: boundary.x + padding, y: boundary.y + boundary.height - 10 * scaleY - padding },
        { x: boundary.x + boundary.width - 10 * scaleX - padding, y: boundary.y + boundary.height - 10 * scaleY - padding },
      ];

      cornerPositions.forEach((pos, idx) => {
        newPlacements.push({
          id: `placement-corner-${idx}`,
          x: pos.x,
          y: pos.y,
          width: 10 * scaleX,
          height: 10 * scaleY,
        });
      });
    }

    setPlacements(newPlacements);
  }, [boundary, shotInfo, config, calculateScaling, setPlacements]);

  const saveLayout = async () => {
    if (!productId) {
      alert('Product ID is missing.');
      return;
    }

    try {
      await saveLayoutMutation({
        variables: {
          input: {
            title,
            productId,
            boundary,
            chips,
            scribelanes,
            placements,
            shotInfo,
            config,
            imageUrl,
          },
        },
      });
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Failed to save layout.');
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
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setImageUrl(base64);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, [setImageUrl]);

  const nextStep = useCallback(async () => {
    if (currentStep === 0 && imageUrl) {
      await runDetection(imageUrl);
    }
    setCurrentStep(Math.min(currentStep + 1, 3));
  }, [currentStep, imageUrl, runDetection, setCurrentStep]);

  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  return {
    autoArrange,
    saveLayout,
    handlePaste,
    updatePlacement,
    nextStep,
    prevStep,
    runDetection,
  };
};
