import React, { memo } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Group, Text } from 'react-konva';
import { useLayoutStore } from '../store/useLayoutStore';
import { useCanvasLogic } from '../hooks/useCanvasLogic';

// Sub-component for Boundary & Chips to minimize re-renders
const StaticElements = memo(({ boundary, chips, selectedId, stageScale }: any) => (
  <Layer>
    {/* SCRIBELANE AREA VISUALIZATION */}
    {boundary?.visible && (
      <Group opacity={0.4}>
        <Rect
          x={boundary.x} y={boundary.y} width={boundary.width} height={boundary.height}
          fill="rgba(99, 102, 241, 0.3)"
        />
        {chips.filter((c: any) => c.visible).map((chip: any) => (
          <Rect
            key={`sc-cut-${chip.id}`}
            x={chip.x} y={chip.y} width={chip.width} height={chip.height}
            fill="black"
            globalCompositeOperation="destination-out"
          />
        ))}
      </Group>
    )}

    {/* BOUNDARY & CHIPS */}
    {boundary?.visible && (
      <Rect
        x={boundary.x} y={boundary.y} width={boundary.width} height={boundary.height}
        stroke={selectedId === boundary.id ? "#6366f1" : "#ef4444"}
        strokeWidth={2 / stageScale} dash={[10 / stageScale, 5 / stageScale]}
      />
    )}
    {chips.filter((c: any) => c.visible).map((chip: any) => (
      <Rect
        key={chip.id}
        x={chip.x} y={chip.y} width={chip.width} height={chip.height}
        stroke={selectedId === chip.id ? "#6366f1" : "#10b981"}
        strokeWidth={1.5 / stageScale}
        fill={chip.isManual ? "rgba(245, 158, 11, 0.05)" : "rgba(16, 185, 129, 0.02)"}
      />
    ))}
  </Layer>
));

export const LayoutCanvas: React.FC = () => {
  // Use fine-grained selectors to prevent unnecessary re-renders
  const boundary = useLayoutStore(state => state.boundary);
  const chips = useLayoutStore(state => state.chips);
  const placements = useLayoutStore(state => state.placements);
  const updatePlacement = useLayoutStore(state => state.updatePlacement);
  const currentStep = useLayoutStore(state => state.currentStep);
  const selectedId = useLayoutStore(state => state.selectedId);
  const selectElement = useLayoutStore(state => state.selectElement);
  const setStageRef = useLayoutStore(state => state.setStageRef);

  const {
    containerRef, stageRef, img, status, dimensions,
    stageScale, stagePos, setStagePos, handleWheel,
    handleMouseDown, handleMouseMove, handleMouseUp, tempRect
  } = useCanvasLogic();

  // Register stageRef globally for thumbnail capture
  React.useEffect(() => {
    setStageRef(stageRef);
    return () => setStageRef(null);
  }, [stageRef, setStageRef]);

  if (status === 'loading') {
    return <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 animate-pulse rounded-md border border-slate-200 dark:border-slate-800" />;
  }

  return (
    <div 
      ref={containerRef} 
      className="flex-1 w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 rounded-md shadow-inner transition-colors duration-300"
    >
      {img && dimensions.width > 0 && dimensions.height > 0 ? (
        <Stage 
          ref={stageRef}
          width={dimensions.width} height={dimensions.height}
          scaleX={stageScale} scaleY={stageScale}
          x={stagePos.x} y={stagePos.y}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          draggable={!tempRect}
          onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
          style={{ cursor: currentStep === 1 ? 'crosshair' : 'grab' }}
          onClick={() => selectElement(null)}
        >
          <Layer>
            <KonvaImage image={img} opacity={1} />
          </Layer>

          {/* Optimized Static Layer */}
          <StaticElements 
            boundary={boundary} 
            chips={chips} 
            selectedId={selectedId} 
            stageScale={stageScale} 
          />

          <Layer>
            {/* PLACEMENTS (Interactive) */}
            {currentStep >= 2 && placements.map((p) => (
               <Group 
                  key={p.id}
                  x={p.x + p.width / 2} y={p.y + p.height / 2}
                  draggable
                  dragBoundFunc={(pos) => {
                    const transform = stageRef.current?.getAbsoluteTransform().copy().invert();
                    if (!transform || !boundary) return pos;
                    const stagePos = transform.point(pos);
                    
                    let tx = Math.max(boundary.x, Math.min(boundary.x + boundary.width, stagePos.x));
                    let ty = Math.max(boundary.y, Math.min(boundary.y + boundary.height, stagePos.y));

                    return stageRef.current!.getAbsoluteTransform().point({ x: tx, y: ty });
                  }}
                  onDragEnd={(e) => {
                    const nx = e.target.x();
                    const ny = e.target.y();
                    updatePlacement(p.id, { x: nx - p.width / 2, y: ny - p.height / 2 });
                  }}
               >
                 <Circle 
                    radius={Math.max(p.width, p.height) / 2}
                    fill="#3b82f6" stroke="#ffffff" strokeWidth={2 / stageScale}
                    shadowBlur={5 / stageScale} shadowColor="rgba(0,0,0,0.3)"
                 />
                 <Text 
                    text="KEY" fontSize={6 / stageScale} fill="white" align="center"
                    offsetX={6 / stageScale} offsetY={3 / stageScale} fontStyle="bold"
                 />
               </Group>
            ))}

            {tempRect && (
              <Rect 
                x={tempRect.x} y={tempRect.y} width={tempRect.w} height={tempRect.h}
                stroke="#f59e0b" strokeWidth={1 / stageScale} dash={[5 / stageScale, 2 / stageScale]}
              />
            )}
          </Layer>
        </Stage>
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-700 transition-colors">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-slate-800"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Workspace</span>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/80 dark:bg-black/60 backdrop-blur rounded-sm text-[10px] font-black text-slate-600 dark:text-white/50 border border-slate-200/60 dark:border-white/10 pointer-events-none shadow-sm transition-colors">
        {Math.round(stageScale * 100)}% ZOOM
      </div>
    </div>
  );
};
