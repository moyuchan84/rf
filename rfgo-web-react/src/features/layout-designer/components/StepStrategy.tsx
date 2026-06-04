import React, { useState, useEffect } from 'react';
import { LayoutGrid, Target, Zap, Plus, Trash2, Clipboard, X, Settings, RotateCcw, Sliders } from 'lucide-react';
import { LayoutCanvas } from './LayoutCanvas';
import { useLayoutStore, CustomElementInput } from '../store/useLayoutStore';
import { cn } from '@/shared/utils/cn';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface StepStrategyProps {
  onAutoArrange: () => void;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ onAutoArrange }) => {
  const { config, setConfig, placements, boundary } = useLayoutStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [tempElements, setTempElements] = useState<CustomElementInput[]>([]);

  // Synchronize config.elements with config.n when in COUNT mode
  useEffect(() => {
    if (config.elementMode === 'COUNT' || !config.elementMode) {
      const currentElements = config.elements || [];
      const targetCount = config.n || 1;
      
      if (currentElements.length !== targetCount) {
        let newElements = [...currentElements];
        const defaultSize = boundary 
          ? Math.max(15, Math.min(boundary.width, boundary.height) * 0.03)
          : 20;
        
        if (newElements.length < targetCount) {
          const toAdd = targetCount - newElements.length;
          for (let i = 0; i < toAdd; i++) {
            newElements.push({
              id: uuidv4(),
              name: `Key ${newElements.length + 1}`,
              width: defaultSize,
              height: defaultSize,
              anchor: 'NONE'
            });
          }
        } else {
          newElements = newElements.slice(0, targetCount);
        }
        
        setConfig({ elements: newElements });
      }
    }
  }, [config.n, config.elementMode, config.elements, boundary, setConfig]);

  const handleOpenModal = () => {
    setTempElements(config.elements || []);
    setClipboardText('');
    setIsModalOpen(true);
  };

  const handleAddRow = () => {
    const defaultSize = boundary 
      ? Math.max(15, Math.min(boundary.width, boundary.height) * 0.03)
      : 20;
    setTempElements(prev => [
      ...prev,
      {
        id: uuidv4(),
        name: `Key ${prev.length + 1}`,
        width: defaultSize,
        height: defaultSize,
        anchor: 'NONE'
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setTempElements(prev => prev.filter(el => el.id !== id));
  };

  const handleUpdateRow = (id: string, updates: Partial<CustomElementInput>) => {
    setTempElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleImportClipboard = () => {
    if (!clipboardText.trim()) {
      toast.error("Please paste clipboard data first");
      return;
    }
    
    const lines = clipboardText.split('\n');
    const parsed: CustomElementInput[] = [];
    const defaultSize = boundary 
      ? Math.max(15, Math.min(boundary.width, boundary.height) * 0.03)
      : 20;
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      let parts = trimmed.split(/[\t,;]+/);
      if (parts.length === 1) {
        parts = trimmed.split(/\s+/);
      }
      
      if (parts.length > 0) {
        const name = parts[0].trim() || `Key ${tempElements.length + parsed.length + 1}`;
        
        let width = defaultSize;
        let height = defaultSize;
        let anchor: CustomElementInput['anchor'] = 'NONE';
        
        if (parts.length >= 2) {
          const w = parseFloat(parts[1]);
          if (!isNaN(w)) width = w;
        }
        if (parts.length >= 3) {
          const h = parseFloat(parts[2]);
          if (!isNaN(h)) height = h;
        } else if (parts.length === 2) {
          const w = parseFloat(parts[1]);
          if (!isNaN(w)) height = w;
        }
        
        if (parts.length >= 4) {
          const anchorStr = parts[3].trim().toUpperCase();
          if (['NONE', 'CENTER', 'EDGE'].includes(anchorStr)) {
            anchor = anchorStr as any;
          } else if (anchorStr.startsWith('CORNER') || anchorStr.startsWith('EDGE') || anchorStr.startsWith('BORDER')) {
            anchor = 'EDGE';
          }
        }
        
        parsed.push({
          id: uuidv4(),
          name,
          width,
          height,
          anchor
        });
      }
    });
    
    if (parsed.length > 0) {
      setTempElements(prev => [...prev, ...parsed]);
      setClipboardText('');
      toast.success(`Successfully imported ${parsed.length} elements!`);
    } else {
      toast.error("Failed to parse elements. Check formatting.");
    }
  };

  const handleApplyElements = () => {
    if (tempElements.length === 0) {
      toast.error("Please add at least one element");
      return;
    }
    setConfig({
      elementMode: 'CUSTOM',
      elements: tempElements,
      n: tempElements.length
    });
    setIsModalOpen(false);
    toast.success(`Configured ${tempElements.length} custom elements`);
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">Placement Strategy</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-md">
          <Target className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Elements: {placements.length}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner transition-colors">
          <LayoutCanvas />
        </div>

        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 shrink-0 custom-scrollbar">
          {/* Configuration Card */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm transition-colors">
            
            {/* Mode Select Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Element Entry Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfig({ elementMode: 'COUNT' })}
                  className={cn(
                    "p-2.5 border rounded-md text-[10px] font-black transition-all text-center",
                    config.elementMode === 'COUNT' || !config.elementMode
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50"
                  )}
                >
                  Quick Count
                </button>
                <button
                  onClick={() => {
                    setConfig({ elementMode: 'CUSTOM' });
                    if (!config.elements || config.elements.length === 0) {
                      const defaultSize = boundary 
                        ? Math.max(15, Math.min(boundary.width, boundary.height) * 0.03)
                        : 20;
                      setConfig({
                        elements: Array.from({ length: config.n || 5 }, (_, i) => ({
                          id: uuidv4(),
                          name: `Key ${i + 1}`,
                          width: defaultSize,
                          height: defaultSize,
                          anchor: 'NONE'
                        }))
                      });
                    }
                  }}
                  className={cn(
                    "p-2.5 border rounded-md text-[10px] font-black transition-all text-center",
                    config.elementMode === 'CUSTOM'
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50"
                  )}
                >
                  Custom List
                </button>
              </div>
            </div>

            {/* Mode-specific input */}
            {(config.elementMode === 'COUNT' || !config.elementMode) ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Number of Elements</label>
                <input 
                  type="number"
                  value={config.n}
                  onChange={(e) => setConfig({ n: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleOpenModal}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-md text-[10px] font-black tracking-wider transition-all uppercase flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage Elements
                </button>
              </div>
            )}

            {/* Element Grouping List (Shown always to allow grouping directly in sidebar) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Element Grouping</label>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md p-2 bg-slate-50 dark:bg-slate-950/30 custom-scrollbar">
                {(config.elements || []).length === 0 ? (
                  <div className="text-[9px] font-bold text-slate-400 text-center py-4">No elements found</div>
                ) : (
                  (config.elements || []).map((el) => (
                    <div key={el.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded shadow-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate pr-1" title={el.name}>
                          {el.name}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500">
                          {el.width}x{el.height}
                        </span>
                      </div>
                      
                      {/* Segmented Button Group for Grouping */}
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded border border-slate-200/50 dark:border-slate-800">
                        {(['NONE', 'CENTER', 'EDGE'] as const).map((anchorType) => (
                          <button
                            key={anchorType}
                            onClick={() => {
                              const newElements = (config.elements || []).map(item => 
                                item.id === el.id ? { ...item, anchor: anchorType } : item
                              );
                              setConfig({ elements: newElements });
                            }}
                            className={cn(
                              "px-1.5 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-wider transition-all",
                              el.anchor === anchorType
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                            )}
                          >
                            {anchorType === 'NONE' ? 'Auto' : anchorType === 'CENTER' ? 'Center' : 'Edge'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-1">Algorithm</label>
              <div className="grid grid-cols-1 gap-2">
                {(['UNIFORM_LINEAR', 'GREEDY_GRID', 'BEST_FIT_BIN_PACKING'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setConfig({ strategy: s })}
                    className={cn(
                      "w-full p-3 border rounded-md text-left text-[10px] font-black transition-all shadow-sm flex items-center justify-between group",
                      config.strategy === s 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50"
                    )}
                  >
                    {s.replace(/_/g, ' ')}
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      config.strategy === s ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-400"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onAutoArrange}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Run Placement
            </button>
          </div>

          {/* Guidelines */}
          <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-md">
            <h5 className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Instructions</h5>
            <ul className="text-[9px] font-bold text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Set count or customize the list of elements</li>
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Group elements (Center, Edge, Auto) in the sidebar</li>
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Click 'Run Placement' to auto-arrange</li>
              <li className="flex gap-2"><span className="text-indigo-500">•</span> Drag elements on the canvas to fine-tune</li>
            </ul>
          </div>
        </div>
      </div>

      {/* POPUP MODAL FOR CUSTOM ELEMENTS */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/60 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Custom Placement Elements
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Define elements with custom dimensions and anchors, or paste a list from your clipboard.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Clipboard Paste Area (Left Panel) */}
              <div className="w-80 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Clipboard className="w-3.5 h-3.5" />
                    Paste From Clipboard
                  </label>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Format: <code className="font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-[8px] text-indigo-600 dark:text-indigo-400">Name [tab/comma] Width [tab/comma] Height</code> (one element per line).
                  </p>
                </div>
                
                <textarea
                  value={clipboardText}
                  onChange={(e) => setClipboardText(e.target.value)}
                  placeholder="Key_A&#9;20&#9;20&#10;Key_B&#9;30&#9;15&#10;Key_C&#9;20&#9;20&#9;CENTER"
                  className="flex-1 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-3 text-[10px] font-mono outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
                />

                <button
                  onClick={handleImportClipboard}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Import Clipboard
                </button>
              </div>

              {/* Elements Table (Right Panel) */}
              <div className="flex-1 p-6 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Defined Rows ({tempElements.length})
                  </span>
                  <button
                    onClick={handleAddRow}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 w-12 text-center">No.</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4 w-28">Width (X)</th>
                        <th className="py-3 px-4 w-28">Height (Y)</th>
                        <th className="py-3 px-4 w-44">Anchor Group</th>
                        <th className="py-3 px-4 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[10px]">
                      {tempElements.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-600 font-bold">
                            No elements defined. Please click 'Add Row' or paste from clipboard.
                          </td>
                        </tr>
                      ) : (
                        tempElements.map((el, index) => (
                          <tr key={el.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="py-2.5 px-4 text-center font-bold text-slate-400 dark:text-slate-600">{index + 1}</td>
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                value={el.name}
                                onChange={(e) => handleUpdateRow(el.id, { name: e.target.value })}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none py-1 font-bold text-slate-700 dark:text-slate-200 transition-colors"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                value={el.width}
                                onChange={(e) => handleUpdateRow(el.id, { width: Math.max(1, parseFloat(e.target.value) || 1) })}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none py-1 font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                value={el.height}
                                onChange={(e) => handleUpdateRow(el.id, { height: Math.max(1, parseFloat(e.target.value) || 1) })}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none py-1 font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors"
                              />
                            </td>
                            <td className="py-2.5 px-4">
                              <select
                                value={el.anchor}
                                onChange={(e) => handleUpdateRow(el.id, { anchor: e.target.value as any })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                              >
                                <option value="NONE">Auto (Others)</option>
                                <option value="CENTER">Center</option>
                                <option value="EDGE">Edge (4 Corners)</option>
                              </select>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                onClick={() => handleRemoveRow(el.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all custom elements?")) {
                    setTempElements([]);
                  }
                }}
                className="px-4 py-2 text-rose-600 hover:text-rose-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyElements}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                >
                  Apply & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
