import React, { useEffect } from 'react';
import { Crosshair, Eye, EyeOff, Trash2, Box, Layers, MousePointer2, Plus, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { useLayoutStore, GeometricObject } from '../store/useLayoutStore';
import { useLayoutDesigner } from '../hooks/useLayoutDesigner';
import { cn } from '@/shared/utils/cn';

export const StepAnalysis: React.FC = () => {
  const { 
    boundary, chips, setBoundary, removeChip, setChips, 
    toggleRole, isAddMode, setAddMode, selectedId, selectElement 
  } = useLayoutStore();
  
  const { analyzeScribelane } = useLayoutDesigner();

  // Re-calculate Scribelane whenever visible elements change
  useEffect(() => {
    analyzeScribelane();
  }, [boundary?.visible, chips.filter(c => c.visible).length, analyzeScribelane]);

  const toggleVisibility = (id: string) => {
    if (boundary?.id === id) {
      setBoundary({ ...boundary, visible: !boundary.visible });
    } else {
      setChips(chips.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
    }
  };

  const renderItem = (item: GeometricObject, isBoundary: boolean = false) => (
    <div 
      key={item.id} 
      onClick={() => selectElement(item.id)}
      className={cn(
        "group flex items-center justify-between p-3 bg-slate-950 border transition-all cursor-pointer",
        selectedId === item.id ? "border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10" : "border-slate-800 hover:border-slate-700",
        item.tag === 'BOUNDARY' ? "rounded-xl border-l-4 border-l-red-500" : "rounded-xl border-l-4 border-l-emerald-500",
        !item.visible && "opacity-40 grayscale"
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300 truncate">
            {isBoundary ? 'Reticle Boundary' : (item.isManual ? 'Manual Chip' : `Chip #${chips.indexOf(item) + 1}`)}
          </span>
          {item.isManual && <span className="text-[7px] bg-indigo-500/20 text-indigo-400 px-1 rounded">ADD</span>}
        </div>
        <span className="text-[8px] text-slate-600 font-mono">
          {item.width.toFixed(0)}x{item.height.toFixed(0)} @ {item.x.toFixed(0)},{item.y.toFixed(0)}
        </span>
      </div>
      
      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => toggleRole(item.id)}
          title="Switch Role (Boundary <-> Chip)"
          className="p-1.5 text-slate-600 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeftRight className="w-3 h-3" />
        </button>
        <button 
          onClick={() => toggleVisibility(item.id)}
          className="p-1.5 text-slate-600 hover:text-white transition-colors"
        >
          {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        {!isBoundary && (
          <button 
            onClick={() => removeChip(item.id)}
            className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex gap-6 p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between shrink-0 px-2">
          <div className="flex items-center gap-3">
            <Crosshair className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Detection Review</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => analyzeScribelane()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Recalculate Lanes
            </button>
            <button 
              onClick={() => setAddMode(!isAddMode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                isAddMode 
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              )}
            >
              {isAddMode ? <MousePointer2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {isAddMode ? "Drawing Mode" : "Add Chip"}
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-inner">
          <LayoutCanvas />
          {isAddMode && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600/90 backdrop-blur-xl rounded-full shadow-2xl pointer-events-none animate-bounce border border-indigo-400">
              <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Plus className="w-4 h-4 fill-white" /> Click & Drag on Canvas to Define New Chip
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-80 flex flex-col gap-4 shrink-0">
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden max-h-[calc(100vh-220px)]">
          <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0 flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Elements Inventory</h4>
            <span className="text-[8px] font-bold px-2 py-1 bg-slate-800 rounded-lg text-slate-400">
              COUNT: {chips.length + (boundary ? 1 : 0)}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {boundary && (
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Boundary
                  </span>
                </div>
                {renderItem(boundary, true)}
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <Box className="w-3 h-3" /> Chips ({chips.filter(c => c.visible).length})
                </span>
              </div>
              <div className="space-y-2">
                {chips.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">No Chips Found</span>
                  </div>
                ) : (
                  chips.map(chip => renderItem(chip))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
