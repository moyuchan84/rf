import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Info, Layout, Layers, Image as ImageIcon, ClipboardPaste } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useKeyDesignStore } from '../store/keyDesignStore';
import { useKeyDesign } from '../hooks/useKeyDesign';
import { useMasterData } from '../../master-data/hooks/useMasterData';
import { AxisInfo, CreateKeyDesignInput } from '../types';
import toast from 'react-hot-toast';

const defaultAxisInfo: AxisInfo = {
  w: { pitch: 0, cd: 0 },
  m: { pitch: 0, cd: 0 },
};

const KeyDesignForm: React.FC = () => {
  const { isModalOpen, modalType, selectedDesign, closeModal } = useKeyDesignStore();
  const { createKeyDesign, updateKeyDesign } = useKeyDesign();
  const { processPlans } = useMasterData();

  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState('Align');
  const [sizeX, setSizeX] = useState(0);
  const [sizeY, setSizeY] = useState(0);
  const [isVertical, setIsVertical] = useState(true);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [description, setDescription] = useState('');
  const [gdsPath, setGdsPath] = useState('');
  const [edmList, setEdmList] = useState<string[]>([]);
  const [newEdm, setNewEdm] = useState('');
  const [xAxis, setXAxis] = useState<AxisInfo>(defaultAxisInfo);
  const [yAxis, setYAxis] = useState<AxisInfo>(defaultAxisInfo);
  const [images, setImages] = useState<string[]>([]);
  const [selectedProcessPlanIds, setSelectedProcessPlanIds] = useState<number[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (modalType === 'UPDATE' && selectedDesign) {
      setName(selectedDesign.name);
      setKeyType(selectedDesign.keyType);
      setSizeX(selectedDesign.sizeX);
      setSizeY(selectedDesign.sizeY);
      setIsVertical(selectedDesign.isVertical);
      setIsHorizontal(selectedDesign.isHorizontal);
      setRotation(selectedDesign.rotation);
      setDescription(selectedDesign.description || '');
      setGdsPath(selectedDesign.gdsPath || '');
      setEdmList(selectedDesign.edmList || []);
      setXAxis(selectedDesign.xAxis || defaultAxisInfo);
      setYAxis(selectedDesign.yAxis || defaultAxisInfo);
      setImages(selectedDesign.images || []);
      setSelectedProcessPlanIds(selectedDesign.processPlans?.map(p => p.id) || []);
    } else {
      setName('');
      setKeyType('Align');
      setSizeX(0);
      setSizeY(0);
      setIsVertical(true);
      setIsHorizontal(true);
      setRotation(0);
      setDescription('');
      setGdsPath('');
      setEdmList([]);
      setXAxis(defaultAxisInfo);
      setYAxis(defaultAxisInfo);
      setImages([]);
      setSelectedProcessPlanIds([]);
    }
  }, [modalType, selectedDesign]);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;

      for (const item of clipboardItems) {
        const imageTypes = item.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setImages(prev => [...prev, base64]);
            toast.success('Image added from clipboard');
          };
          reader.readAsDataURL(blob);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        toast.error('No image found in clipboard');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.error('Failed to read clipboard. Please check browser permissions.');
    }
  };

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateKeyDesignInput = {
      name,
      keyType,
      sizeX,
      sizeY,
      isVertical,
      isHorizontal,
      rotation,
      description,
      gdsPath,
      edmList,
      xAxis,
      yAxis,
      images,
      processPlanIds: selectedProcessPlanIds,
    };

    if (modalType === 'CREATE') {
      await createKeyDesign(input);
    } else if (modalType === 'UPDATE' && selectedDesign) {
      await updateKeyDesign(selectedDesign.id, input);
    }
    closeModal();
  };

  const handleAddEdm = () => {
    if (newEdm && !edmList.includes(newEdm)) {
      setEdmList([...edmList, newEdm]);
      setNewEdm('');
    }
  };

  const handleRemoveEdm = (item: string) => {
    setEdmList(edmList.filter(e => e !== item));
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAxisChange = (axis: 'X' | 'Y', type: 'w' | 'm', field: 'pitch' | 'cd', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (axis === 'X') {
      setXAxis({ ...xAxis, [type]: { ...xAxis[type], [field]: numValue } });
    } else {
      setYAxis({ ...yAxis, [type]: { ...yAxis[type], [field]: numValue } });
    }
  };

  const toggleProcessPlan = (id: number) => {
    if (selectedProcessPlanIds.includes(id)) {
      setSelectedProcessPlanIds(selectedProcessPlanIds.filter(pId => pId !== id));
    } else {
      setSelectedProcessPlanIds([...selectedProcessPlanIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {modalType === 'CREATE' ? 'New Key Design' : 'Update Key Design'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Define measurement specifications</p>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-24">
          {/* Section 1: Basic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. ALIGN_6X12_V1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Type</label>
                <input
                  type="text"
                  required
                  value={keyType}
                  onChange={(e) => setKeyType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. Align, Overlay, Zero..."
                />
              </div>
            </div>
          </section>

          {/* Section 2: Geometry */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Layout className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Geometry & Properties</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Size X (μm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sizeX}
                  onChange={(e) => setSizeX(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Size Y (μm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sizeY}
                  onChange={(e) => setSizeY(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rotation (°)</label>
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="flex gap-4 items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={isVertical} onChange={(e) => setIsVertical(e.target.checked)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isVertical ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>
                    {isVertical && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vertical</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={isHorizontal} onChange={(e) => setIsHorizontal(e.target.checked)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isHorizontal ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}>
                    {isHorizontal && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horizontal</span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 3: Images (Clipboard Support) */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Reference Images</h3>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded uppercase tracking-widest">
                <ClipboardPaste className="w-3 h-3" />
                Paste from clipboard (Ctrl+V)
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img, index) => (
                <div key={index} className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={handlePasteFromClipboard}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all outline-none group"
              >
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Add from Clipboard</span>
              </button>
            </div>
          </section>

          {/* Section 4: Technical Specs (X/Y Axis) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Technical Specifications</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* X Axis */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">X Axis Measurements</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Window (W)</p>
                    <input
                      type="number" step="0.001" placeholder="Pitch"
                      value={xAxis.w.pitch} onChange={(e) => handleAxisChange('X', 'w', 'pitch', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number" step="0.001" placeholder="CD"
                      value={xAxis.w.cd} onChange={(e) => handleAxisChange('X', 'w', 'cd', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Main (M)</p>
                    <input
                      type="number" step="0.001" placeholder="Pitch"
                      value={xAxis.m.pitch} onChange={(e) => handleAxisChange('X', 'm', 'pitch', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number" step="0.001" placeholder="CD"
                      value={xAxis.m.cd} onChange={(e) => handleAxisChange('X', 'm', 'cd', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Y Axis */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Y Axis Measurements</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Window (W)</p>
                    <input
                      type="number" step="0.001" placeholder="Pitch"
                      value={yAxis.w.pitch} onChange={(e) => handleAxisChange('Y', 'w', 'pitch', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number" step="0.001" placeholder="CD"
                      value={yAxis.w.cd} onChange={(e) => handleAxisChange('Y', 'w', 'cd', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Main (M)</p>
                    <input
                      type="number" step="0.001" placeholder="Pitch"
                      value={yAxis.m.pitch} onChange={(e) => handleAxisChange('Y', 'm', 'pitch', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="number" step="0.001" placeholder="CD"
                      value={yAxis.m.cd} onChange={(e) => handleAxisChange('Y', 'm', 'cd', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Process Plans Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Linked Process Plans</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id && !selectedProcessPlanIds.includes(id)) {
                      setSelectedProcessPlanIds([...selectedProcessPlanIds, id]);
                    }
                    e.target.value = ""; // Reset select
                  }}
                  value=""
                >
                  <option value="" disabled>Select Process Plan to add...</option>
                  {processPlans
                    .filter(plan => !selectedProcessPlanIds.includes(plan.id))
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.designRule}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedProcessPlanIds.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                    <Info className="w-3 h-3" /> No process plans linked
                  </p>
                ) : (
                  selectedProcessPlanIds.map(id => {
                    const plan = processPlans.find(p => p.id === id);
                    if (!plan) return null;
                    return (
                      <span 
                        key={id} 
                        className="bg-indigo-600 text-white pl-3 pr-1.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-2 shadow-md shadow-indigo-600/20 animate-in zoom-in duration-200"
                      >
                        {plan.designRule}
                        <button 
                          type="button" 
                          onClick={() => toggleProcessPlan(id)}
                          className="hover:bg-white/20 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Section 6: Rich Description & EDM */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Description & Resources</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description (Rich Text)</label>
                <div className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-64 shadow-inner">
                  <ReactQuill 
                    theme="snow" 
                    value={description} 
                    onChange={setDescription} 
                    className="flex-1 bg-white dark:bg-slate-950 dark:text-white [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-slate-100 dark:[&>.ql-toolbar]:border-slate-800 [&>.ql-container>.ql-editor]:text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GDS Path</label>
                  <input
                    type="text"
                    value={gdsPath}
                    onChange={(e) => setGdsPath(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    placeholder="/path/to/design.gds"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">EDM List</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEdm}
                      onChange={(e) => setNewEdm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEdm())}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      placeholder="Add EDM tag"
                    />
                    <button type="button" onClick={handleAddEdm} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    {edmList.map(edm => (
                      <span key={edm} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1.5 uppercase tracking-wider group">
                        {edm}
                        <button type="button" onClick={() => handleRemoveEdm(edm)} className="hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-6 py-2.5 rounded-lg text-xs font-black text-slate-500 hover:text-slate-700 dark:hover:text-white uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            {modalType === 'CREATE' ? 'Create Blueprint' : 'Update Design'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyDesignForm;
