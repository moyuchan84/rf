import React, { useState, useEffect } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useMasterData } from '../hooks/useMasterData';

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

  const [formData, setFormData] = useState<any>({});
  const mode = selectedNode?.id === -1 ? 'create' : 'edit';

  useEffect(() => {
    if (!selectedNode) return;

    if (mode === 'edit') {
      setFormData({
        designRule: selectedNode.data.designRule || '',
        optionName: selectedNode.data.optionName || '',
        partId: selectedNode.data.partId || '',
        productName: selectedNode.data.productName || '',
        metaInfo: {
          chip: selectedNode.data.metaInfo?.chip || '',
          shot: selectedNode.data.metaInfo?.shot || '',
          mto: selectedNode.data.metaInfo?.mto || '',
        },
      });
    } else {
      setFormData({
        designRule: '',
        optionName: '',
        partId: '',
        productName: '',
        metaInfo: { chip: '', shot: '', mto: '' },
      });
    }
  }, [selectedNode, mode]);

  if (!selectedNode) return null;

  const handleSave = async () => {
    try {
      if (selectedNode.type === 'plan') {
        if (mode === 'create') {
          await createProcessPlan(formData.designRule);
        }
      } else if (selectedNode.type === 'option') {
        if (mode === 'create') {
          await createBeolOption(selectedNode.data.parentId, formData.optionName);
        }
      } else if (selectedNode.type === 'product') {
        if (mode === 'create') {
          await createProduct(
            selectedNode.data.parentId, 
            formData.partId, 
            formData.productName, 
            formData.metaInfo
          );
        } else {
          await updateProduct(
            selectedNode.id, 
            formData.productName, 
            formData.metaInfo
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
        await deleteProduct(selectedNode.id);
      }
      setIsFormOpen(false);
      setSelectedNode(null);
    } catch (e) {
      alert('Error deleting: ' + e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-600 tracking-[0.2em]">
            {mode === 'create' ? 'Create' : 'Edit'} {selectedNode.type}
          </span>
        </div>
        {mode === 'edit' && selectedNode.type === 'product' && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-12 max-w-3xl mx-auto w-full space-y-10">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {selectedNode.path.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === selectedNode.path.length - 1 ? 'text-slate-600' : ''}>{p}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-8">
          {selectedNode.type === 'plan' && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Design Rule</label>
              <input
                value={formData.designRule}
                onChange={(e) => setFormData({ ...formData, designRule: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                placeholder="e.g. 14nm"
              />
            </div>
          )}

          {selectedNode.type === 'option' && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Option Name (BEOL)</label>
              <input
                value={formData.optionName}
                onChange={(e) => setFormData({ ...formData, optionName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                placeholder="e.g. OPT_A"
              />
            </div>
          )}

          {selectedNode.type === 'product' && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Part ID</label>
                  <input
                    value={formData.partId}
                    disabled={mode === 'edit'}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold disabled:opacity-50"
                    placeholder="e.g. S5E9925"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Product Name</label>
                  <input
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold"
                    placeholder="e.g. Exynos 2200"
                  />
                </div>
              </div>

              <div className="p-8 border border-slate-100 rounded-[2rem] bg-slate-50/30 space-y-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Meta Information</h4>
                <div className="grid grid-cols-3 gap-6">
                  {['chip', 'shot', 'mto'].map((field) => (
                    <div key={field} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{field}</label>
                      <input
                        value={formData.metaInfo?.[field] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaInfo: { ...formData.metaInfo, [field]: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="p-8 border-t border-slate-50 flex gap-4 bg-white">
        <button
          onClick={() => {
            setIsFormOpen(false);
            setSelectedNode(null);
          }}
          className="px-8 py-5 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-[0.2em]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl text-xs font-black tracking-[0.3em] shadow-2xl transition-all active:scale-[0.98] uppercase"
        >
          {mode === 'create' ? 'Create' : 'Save Changes'}
        </button>
      </footer>
    </div>
  );
};

export default MasterDataForm;
