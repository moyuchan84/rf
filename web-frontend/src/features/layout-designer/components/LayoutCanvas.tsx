import React from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Group, Text, Line } from 'react-konva';
import { useLayoutStore } from '../store/useLayoutStore';
import { useCanvasLogic } from '../hooks/useCanvasLogic';

export const LayoutCanvas: React.FC = () => {
  const { boundary, chips, laneElements, placements, updatePlacement, currentStep, selectedId, selectElement } = useLayoutStore();
  const {
    containerRef, stageRef, img, status, dimensions,
    stageScale, stagePos, setStagePos, handleWheel,
    handleMouseDown, handleMouseMove, handleMouseUp, tempRect
  } = useCanvasLogic();

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
          onClick={() => selectElement(null)} // Deselect on empty click
        >
          <Layer>
            <KonvaImage image={img} opacity={1} />

            {/* Scribelane Elements (Linearized) */}
            {laneElements.map(lane => (
              <Line 
                key={lane.id}
                points={[lane.p1.x, lane.p1.y, lane.p2.x, lane.p2.y]}
                stroke="#6366f1"
                strokeWidth={2 / stageScale}
                opacity={0.6}
              />
            ))}

            {/* Boundary */}
            {boundary?.visible && (
              <Group onClick={(e) => { e.cancelBubble = true; selectElement(boundary.id); }}>
                <Rect
                  x={boundary.x} y={boundary.y} width={boundary.width} height={boundary.height}
                  stroke={selectedId === boundary.id ? "#6366f1" : "#ef4444"}
                  strokeWidth={(selectedId === boundary.id ? 6 : 4) / stageScale}
                  shadowBlur={selectedId === boundary.id ? 10 / stageScale : 0}
                  shadowColor={selectedId === boundary.id ? "#6366f1" : "#ef4444"}
                  dash={[10 / stageScale, 5 / stageScale]}
                  fill="rgba(239, 68, 68, 0.05)"
                />
                <Text 
                  text="BOUNDARY" x={boundary.x} y={boundary.y - 15 / stageScale} 
                  fill={selectedId === boundary.id ? "#6366f1" : "#ef4444"}
                  fontSize={10 / stageScale} fontStyle="bold"
                />
              </Group>
            )}

            {/* Chips */}
            {chips.map((chip) => (
              chip.visible && (
                <Group key={chip.id} onClick={(e) => { e.cancelBubble = true; selectElement(chip.id); }}>
                  <Rect
                    x={chip.x} y={chip.y} width={chip.width} height={chip.height}
                    stroke={selectedId === chip.id ? "#6366f1" : "#10b981"}
                    strokeWidth={(selectedId === chip.id ? 4 : 2) / stageScale}
                    shadowBlur={selectedId === chip.id ? 8 / stageScale : 0}
                    shadowColor={selectedId === chip.id ? "#6366f1" : "#10b981"}
                    fill={chip.isManual ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.1)"}
                  />
                  <Text 
                    text={chip.isManual ? "MANUAL" : "CHIP"} x={chip.x} y={chip.y - 12 / stageScale} 
                    fill={selectedId === chip.id ? "#6366f1" : "#10b981"}
                    fontSize={8 / stageScale} fontStyle="bold"
                  />
                </Group>
              )
            ))}

            {/* Drawing Temp Rect */}
            {tempRect && (
              <Rect 
                x={tempRect.x} y={tempRect.y} width={tempRect.w} height={tempRect.h}
                stroke="#f59e0b" strokeWidth={1 / stageScale} dash={[5 / stageScale, 2 / stageScale]}
              />
            )}

            {/* Placements */}
            {placements.map((p) => (
               <Circle 
                  key={p.id}
                  x={p.x + p.width / 2} y={p.y + p.height / 2}
                  radius={Math.max(p.width, p.height) / 2}
                  fill="#3b82f6" stroke="#60a5fa" strokeWidth={2 / stageScale}
                  draggable
                  onDragEnd={(e) => {
                    updatePlacement(p.id, { x: e.target.x() - p.width / 2, y: e.target.y() - p.height / 2 });
                  }}
               />
            ))}
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
