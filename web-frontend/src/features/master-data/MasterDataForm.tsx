import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import type { SelectedNode } from './types';
import {
  CREATE_PROCESS_PLAN,
  CREATE_BEOL_OPTION,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from './queries';
import { ChevronRight, Trash2 } from 'lucide-react';

interface Props {
  node: SelectedNode;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

const MasterDataForm: React.FC<Props> = ({ node, mode, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (mode === 'edit') {
      setFormData({
        designRule: node.data.designRule || '',
        optionName: node.data.optionName || '',
        partId: node.data.partId || '',
        productName: node.data.productName || '',
        metaInfo: {
          chip: node.data.metaInfo?.chip || '',
          shot: node.data.metaInfo?.shot || '',
          mto: node.data.metaInfo?.mto || '',
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
  }, [node, mode]);

  const [createPlan] = useMutation(CREATE_PROCESS_PLAN);
  const [createOption] = useMutation(CREATE_BEOL_OPTION);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const handleSave = async () => {
    try {
      if (node.type === 'plan') {
        if (mode === 'create') {
          await createPlan({ variables: { input: { designRule: formData.designRule } } });
        }
      } else if (node.type === 'option') {
        if (mode === 'create') {
          await createOption({
            variables: { input: { optionName: formData.optionName, processPlanId: node.data.id } },
          });
        }
      } else if (node.type === 'product') {
        if (mode === 'create') {
          await createProduct({
            variables: {
              input: {
                partId: formData.partId,
                productName: formData.productName,
                beolOptionId: node.data.id,
                metaInfo: formData.metaInfo,
              },
            },
          });
        } else {
          await updateProduct({
            variables: {
              id: node.id,
              input: {
                productName: formData.productName,
                metaInfo: formData.metaInfo,
              },
            },
          });
        }
      }
      onSuccess();
    } catch (e) {
      alert('Error saving data: ' + e);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (node.type === 'product') {
        await deleteProduct({ variables: { id: node.id } });
      }
      // Add delete for plan/option if needed
      onSuccess();
    } catch (e) {
      alert('Error deleting: ' + e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-600 tracking-[0.2em]">
            {mode === 'create' ? 'Create' : 'Edit'} {node.type}
          </span>
        </div>
        {mode === 'edit' && node.type === 'product' && (
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
          {node.path.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === node.path.length - 1 ? 'text-slate-600' : ''}>{p}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-8">
          {node.type === 'plan' && (
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

          {node.type === 'option' && (
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

          {node.type === 'product' && (
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
          onClick={onCancel}
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
