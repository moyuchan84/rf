import { useRef, useEffect, useState, useCallback } from 'react';
import { useLayoutStore, Point } from '../store/useLayoutStore';
import useImage from 'use-image';
import Konva from 'konva';

export const useCanvasLogic = () => {
  const { imageUrl, currentStep, addChip, isAddMode } = useLayoutStore();
  const [img, status] = useImage(imageUrl || '', 'anonymous');
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRectStart, setNewRectStart] = useState<Point | null>(null);
  const [tempRect, setTempRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setDimensions({ width: offsetWidth, height: offsetHeight });
          return true;
        }
      }
      return false;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    const interval = setInterval(() => { if (measure()) clearInterval(interval); }, 100);
    return () => { ro.disconnect(); clearInterval(interval); };
  }, [currentStep]);

  useEffect(() => {
    if (img && dimensions.width > 0 && dimensions.height > 0) {
      const scaleX = dimensions.width / img.width;
      const scaleY = dimensions.height / img.height;
      const initialScale = Math.min(scaleX, scaleY, 1) * 0.95;
      setStageScale(initialScale);
      setStagePos({
        x: (dimensions.width - img.width * initialScale) / 2,
        y: (dimensions.height - img.height * initialScale) / 2,
      });
    }
  }, [img, dimensions]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  }, []);

  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return { x: (pos.x - stage.x()) / stage.scaleX(), y: (pos.y - stage.y()) / stage.scaleY() };
  }, []);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentStep !== 1 || !isAddMode || e.evt.button !== 0) return;
    const pos = getRelativePointerPosition();
    if (!pos) return;
    setIsDrawing(true);
    setNewRectStart(pos);
  }, [currentStep, isAddMode, getRelativePointerPosition]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !newRectStart) return;
    const pos = getRelativePointerPosition();
    if (!pos) return;
    setTempRect({
      x: Math.min(newRectStart.x, pos.x),
      y: Math.min(newRectStart.y, pos.y),
      w: Math.abs(newRectStart.x - pos.x),
      h: Math.abs(newRectStart.y - pos.y),
    });
  }, [isDrawing, newRectStart, getRelativePointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (tempRect && tempRect.w > 5 && tempRect.h > 5) {
      addChip({ x: tempRect.x, y: tempRect.y, width: tempRect.w, height: tempRect.h });
    }
    setIsDrawing(false);
    setNewRectStart(null);
    setTempRect(null);
  }, [tempRect, addChip]);

  return {
    containerRef, stageRef, img, status, dimensions, stageScale, stagePos, setStagePos,
    handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, tempRect, isDrawing
  };
};
