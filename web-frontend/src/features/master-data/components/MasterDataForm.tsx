import React, { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useMasterData } from '../hooks/useMasterData';
import {type ProductMeta } from '../types';

interface FormData {
  designRule: string;
  optionName: string;
  partId: string;
  productName: string;
  metaInfo: Partial<ProductMeta>;
}

const MasterDataForm: React.FC = () => {
  const { 
    selectedNode, 
    setSelectedNode, 
    setIsFormOpen, 
    createProcessPlan, 
    createBeolOption, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useMasterData();

  const [formData, setFormData] = useState<FormData>(() => {
    if (selectedNode?.id !== -1 && selectedNode?.data) {
      return {
        designRule: selectedNode.data.designRule || '',
        optionName: selectedNode.data.optionName || '',
        partId: selectedNode.data.partId || '',
        productName: selectedNode.data.productName || '',
        metaInfo: {
          processId: selectedNode.data.metaInfo?.processId || '',
          mtoDate: selectedNode.data.metaInfo?.mtoDate ? new Date(selectedNode.data.metaInfo.mtoDate).toISOString().split('T')[0] : '',
          customer: selectedNode.data.metaInfo?.customer || '',
          application: selectedNode.data.metaInfo?.application || '',
          chipSizeX: selectedNode.data.metaInfo?.chipSizeX || 0,
          chipSizeY: selectedNode.data.metaInfo?.chipSizeY || 0,
          slSizeX: selectedNode.data.metaInfo?.slSizeX || 0,
          slSizeY: selectedNode.data.metaInfo?.slSizeY || 0,
        },
      };
    }
    return {
      designRule: '',
      optionName: '',
      partId: '',
      productName: '',
      metaInfo: {
        processId: '',
        mtoDate: '',
        customer: '',
        application: '',
        chipSizeX: 0,
        chipSizeY: 0,
        slSizeX: 0,
        slSizeY: 0,
      }
    };
  });
  const mode = selectedNode?.id === -1 ? 'create' : 'edit';

  if (!selectedNode) return null;

  const handleSave = async () => {
    try {
      // Convert numeric strings to numbers for float fields
      const processedMeta: Partial<ProductMeta> = {
        processId: formData.metaInfo.processId,
        customer: formData.metaInfo.customer,
        application: formData.metaInfo.application,
        chipSizeX: typeof formData.metaInfo.chipSizeX === 'string' ? parseFloat(formData.metaInfo.chipSizeX) : formData.metaInfo.chipSizeX,
        chipSizeY: typeof formData.metaInfo.chipSizeY === 'string' ? parseFloat(formData.metaInfo.chipSizeY) : formData.metaInfo.chipSizeY,
        slSizeX: typeof formData.metaInfo.slSizeX === 'string' ? parseFloat(formData.metaInfo.slSizeX) : formData.metaInfo.slSizeX,
        slSizeY: typeof formData.metaInfo.slSizeY === 'string' ? parseFloat(formData.metaInfo.slSizeY) : formData.metaInfo.slSizeY,
        mtoDate: formData.metaInfo.mtoDate ? new Date(formData.metaInfo.mtoDate).toISOString() : undefined,
      };

      if (selectedNode.type === 'plan') {
        if (mode === 'create') {
          await createProcessPlan(formData.designRule);
        }
      } else if (selectedNode.type === 'option') {
        if (mode === 'create') {
          await createBeolOption(Number(selectedNode.data.parentId), formData.optionName);
        }
      } else if (selectedNode.type === 'product') {
        if (mode === 'create') {
          await createProduct(
            Number(selectedNode.data.parentId), 
            formData.partId, 
            formData.productName, 
            processedMeta
          );
        } else {
          await updateProduct(
            Number(selectedNode.id), 
            formData.productName, 
            processedMeta
          );
        }
      }
      setIsFormOpen(false);
      setSelectedNode(null);
    } catch (e) {
      alert('Error saving data: ' + e);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (selectedNode.type === 'product') {
        await deleteProduct(Number(selectedNode.id));
      }
      setIsFormOpen(false);
      setSelectedNode(null);
    } catch (e) {
      alert('Error deleting: ' + e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/30">
        <div className="flex items-center gap-4">
          <span className={cn(
            "text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-[0.2em] shadow-lg",
            mode === 'create' ? "bg-indigo-600 text-white shadow-indigo-600/20" : "bg-slate-800 text-slate-300 shadow-black/20"
          )}>
            {mode === 'create' ? 'Create' : 'Edit'} {selectedNode.type}
          </span>
        </div>
        {mode === 'edit' && selectedNode.type === 'product' && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-[0.2em] active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full space-y-12 scrollbar-hide">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          {selectedNode.path.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-700" />}
              <span className={cn(i === selectedNode.path.length - 1 ? 'text-indigo-400' : 'text-slate-500')}>{p}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-10">
          {selectedNode.type === 'plan' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Design Rule</label>
              <input
                value={formData.designRule}
                onChange={(e) => setFormData({ ...formData, designRule: e.target.value })}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-800 shadow-2xl"
                placeholder="e.g. 14nm"
              />
            </div>
          )}

          {selectedNode.type === 'option' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Option Name (BEOL)</label>
              <input
                value={formData.optionName}
                onChange={(e) => setFormData({ ...formData, optionName: e.target.value })}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-800 shadow-2xl"
                placeholder="e.g. OPT_A"
              />
            </div>
          )}

          {selectedNode.type === 'product' && (
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Part ID</label>
                  <input
                    value={formData.partId}
                    disabled={mode === 'edit'}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white outline-none focus:border-indigo-600/50 transition-all font-bold disabled:opacity-30 placeholder:text-slate-800 shadow-2xl"
                    placeholder="e.g. S5E9925"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Product Name</label>
                  <input
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] px-8 py-6 text-lg text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-800 shadow-2xl"
                    placeholder="e.g. Exynos 2200"
                  />
                </div>
              </div>

              <div className="p-10 border border-slate-800 rounded-[3rem] bg-slate-950/40 space-y-10 shadow-inner">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Detailed Metadata</h4>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { key: 'processId', label: 'Process ID', type: 'text' },
                    { key: 'customer', label: 'Customer', type: 'text' },
                    { key: 'application', label: 'Application', type: 'text' },
                    { key: 'mtoDate', label: 'MTO Date', type: 'date' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-4">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={formData.metaInfo?.[field.key as keyof ProductMeta] as string || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaInfo: { ...formData.metaInfo, [field.key as keyof ProductMeta]: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-base text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-800"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-6 pt-4">
                  {[
                    { key: 'chipSizeX', label: 'Chip Size X' },
                    { key: 'chipSizeY', label: 'Chip Size Y' },
                    { key: 'slSizeX', label: 'SL Size X' },
                    { key: 'slSizeY', label: 'SL Size Y' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-4">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.metaInfo?.[field.key as keyof ProductMeta] as number || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaInfo: { ...formData.metaInfo, [field.key as keyof ProductMeta]: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-base text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="p-8 border-t border-slate-800/50 flex gap-6 bg-slate-950/20 backdrop-blur-sm">
        <button
          onClick={() => {
            setIsFormOpen(false);
            setSelectedNode(null);
          }}
          className="px-8 py-5 text-[10px] font-black text-slate-500 hover:text-slate-300 transition-all uppercase tracking-[0.3em]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[2rem] text-[10px] font-black tracking-[0.4em] shadow-2xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase"
        >
          {mode === 'create' ? 'Create' : 'Save Changes'}
        </button>
      </footer>
    </div>
  );
};

export default MasterDataForm;
