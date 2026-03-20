import React, { useState } from 'react';
import { X, Info, Layout, Layers, Image as ImageIcon, ExternalLink, Hash, Clock, Box, ZoomIn } from 'lucide-react';
import { useKeyDesignStore } from '../store/keyDesignStore';

const KeyDesignDetail: React.FC = () => {
  const { isModalOpen, modalType, selectedDesign, closeModal, openUpdateModal } = useKeyDesignStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isModalOpen || modalType !== 'VIEW' || !selectedDesign) return null;

  const design = selectedDesign;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      {/* Image Preview Overlay */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8 lg:p-20 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-10 h-10" />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {design.name}
                </h2>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded uppercase tracking-widest">
                  {design.keyType}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <Hash className="w-3 h-3" /> ID: {design.id}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 dark:border-slate-800 pl-3">
                  <Clock className="w-3 h-3" /> Updated: {new Date(design.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => openUpdateModal(design)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-all uppercase tracking-widest"
            >
              Edit Design
            </button>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Visuals & Geometry */}
            <div className="lg:col-span-1 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Geometry</h3>
                </div>
                <div 
                  className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group cursor-zoom-in"
                  onClick={() => design.images && design.images.length > 0 && setPreviewImage(design.images[0])}
                >
                  {design.images && design.images.length > 0 ? (
                    <>
                      <img src={design.images[0]} alt="Main Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div 
                      className="absolute inset-8 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center transition-transform duration-700"
                      style={{ 
                        transform: `rotate(${design.rotation}deg)`,
                        aspectRatio: design.sizeX / design.sizeY || 1
                      }}
                    >
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">
                        Blueprint
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Size X</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{design.sizeX}<span className="text-[10px] ml-1 text-slate-400">μm</span></p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Size Y</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{design.sizeY}<span className="text-[10px] ml-1 text-slate-400">μm</span></p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rotation</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{design.rotation}°</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className={`flex-1 text-center py-1.5 rounded text-[9px] font-black uppercase tracking-widest ${design.isVertical ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                    Vertical
                  </div>
                  <div className={`flex-1 text-center py-1.5 rounded text-[9px] font-black uppercase tracking-widest ${design.isHorizontal ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                    Horizontal
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Linked Plans</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {design.processPlans?.map(plan => (
                    <span key={plan.id} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                      {plan.designRule}
                    </span>
                  ))}
                  {(!design.processPlans || design.processPlans.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic">No process plans linked.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Measurements & Resources */}
            <div className="lg:col-span-2 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Measurement Specifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* X Axis Card */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">X-Axis Data</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Window (W)</p>
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 uppercase">Pitch: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.xAxis.w.pitch}</span></p>
                          <p className="text-[8px] text-slate-500 uppercase">CD: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.xAxis.w.cd}</span></p>
                        </div>
                      </div>
                      <div className="space-y-3 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Main (M)</p>
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 uppercase">Pitch: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.xAxis.m.pitch}</span></p>
                          <p className="text-[8px] text-slate-500 uppercase">CD: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.xAxis.m.cd}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Y Axis Card */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Y-Axis Data</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Window (W)</p>
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 uppercase">Pitch: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.yAxis.w.pitch}</span></p>
                          <p className="text-[8px] text-slate-500 uppercase">CD: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.yAxis.w.cd}</span></p>
                        </div>
                      </div>
                      <div className="space-y-3 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Main (M)</p>
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 uppercase">Pitch: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.yAxis.m.pitch}</span></p>
                          <p className="text-[8px] text-slate-500 uppercase">CD: <span className="text-slate-900 dark:text-slate-200 font-black ml-1">{design.yAxis.m.cd}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Description</h3>
                </div>
                <div 
                  className="prose dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 p-6 rounded-xl border border-slate-100 dark:border-slate-800"
                  dangerouslySetInnerHTML={{ __html: design.description || 'No description available.' }}
                />
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <ExternalLink className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Technical Resources</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">GDS Archive Path</p>
                      <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono text-[10px] text-indigo-600 dark:text-indigo-400 break-all">
                        {design.gdsPath || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">EDM Reference Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {design.edmList.map(edm => (
                          <span key={edm} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 dark:text-slate-400 rounded uppercase tracking-wider">
                            {edm}
                          </span>
                        ))}
                        {design.edmList.length === 0 && <p className="text-[10px] text-slate-400 italic">No EDM tags.</p>}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Gallery</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {design.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-zoom-in relative"
                        onClick={() => setPreviewImage(img)}
                      >
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                    ))}
                    {design.images.length === 0 && <p className="col-span-4 text-[10px] text-slate-400 italic">No images uploaded.</p>}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
          <button
            onClick={closeModal}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyDesignDetail;
