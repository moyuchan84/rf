import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Group } from 'react-konva';
import { useLayoutStore } from '../store/useLayoutStore';
import useImage from 'use-image';

export const LayoutCanvas: React.FC = () => {
  const { boundary, chips, placements, imageUrl, updatePlacement } = useLayoutStore();
  
  // 데이터 URL의 경우 anonymous 설정이 불필요하거나 문제가 될 수 있음 제거
  const [img, status] = useImage(imageUrl || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 컴포넌트 마운트 시 및 imageUrl 변경 시 크기 재측정 강제
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        console.log(`[Canvas] Measuring: ${clientWidth}x${clientHeight}`);
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    
    // 즉시 측정 시도
    updateSize();
    
    // 애니메이션 등으로 인해 지연 측정 필요할 수 있음
    const timer = setTimeout(updateSize, 100);

    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [imageUrl]); // 이미지 URL이 들어올 때 다시 측정

  const { scale, x, y } = useMemo(() => {
    if (!img || dimensions.width === 0 || dimensions.height === 0) return { scale: 1, x: 0, y: 0 };
    
    const scaleX = dimensions.width / img.width;
    const scaleY = dimensions.height / img.height;
    const s = Math.min(scaleX, scaleY, 1) * 0.95;
    
    return {
      scale: s,
      x: (dimensions.width - img.width * s) / 2,
      y: (dimensions.height - img.height * s) / 2
    };
  }, [img, dimensions]);

  // 디버깅 로그 강화
  useEffect(() => {
    console.log(`[Canvas] State -> Status: ${status}, HasImg: ${!!img}, HasURL: ${!!imageUrl}, Dim: ${dimensions.width}x${dimensions.height}`);
  }, [status, img, imageUrl, dimensions]);

  if (status === 'loading' || !imageUrl) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {!imageUrl ? 'Waiting for Image...' : 'Loading Image...'}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] bg-slate-950 relative flex items-center justify-center overflow-hidden border border-slate-800 rounded-2xl">
      {img && dimensions.width > 0 ? (
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer x={x} y={y} scaleX={scale} scaleY={scale}>
            <KonvaImage image={img} opacity={1} />
            <Group opacity={0.8}>
              {boundary && (
                <Rect
                  x={boundary.x}
                  y={boundary.y}
                  width={boundary.width}
                  height={boundary.height}
                  stroke="#10b981"
                  strokeWidth={4 / scale}
                  dash={[10 / scale, 5 / scale]}
                  fill="rgba(16, 185, 129, 0.05)"
                />
              )}
              {chips.map((chip) => (
                <Rect
                  key={chip.id}
                  x={chip.x}
                  y={chip.y}
                  width={chip.width}
                  height={chip.height}
                  stroke="#48BB78"
                  strokeWidth={2 / scale}
                  fill="rgba(72, 187, 120, 0.1)"
                />
              ))}
            </Group>
            {placements.map((p) => (
               <Circle 
                  key={p.id}
                  x={p.x + p.width / 2}
                  y={p.y + p.height / 2}
                  radius={Math.max(p.width, p.height) / 2}
                  fill="#3182CE"
                  stroke="#63B3ED"
                  strokeWidth={2 / scale}
                  draggable
                  onDragEnd={(e) => {
                    updatePlacement(p.id, {
                      x: e.target.x() - p.width / 2,
                      y: e.target.y() - p.height / 2,
                    });
                  }}
               />
            ))}
          </Layer>
        </Stage>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-600">
          <div className="animate-pulse w-12 h-12 bg-slate-900 rounded-full mb-2"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Initializing Canvas...</span>
        </div>
      )}
    </div>
  );
};
