import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Trash2, Loader2, Search, Check, ChevronDown } from 'lucide-react';
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

// Searchable Select Component
interface SearchableSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  onManualClick?: () => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  value, 
  options, 
  onChange, 
  placeholder, 
  loading,
  onManualClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-md px-6 py-4 flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "border-indigo-600/50 shadow-md" : "hover:border-slate-300 dark:hover:border-slate-700",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn("text-sm font-bold", !value && "text-slate-400")}>
          {value || placeholder}
        </span>
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              autoFocus
              className="bg-transparent border-none outline-none text-xs font-bold w-full"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    "px-5 py-3 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors",
                    value === opt ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {opt}
                  {value === opt && <Check className="w-3.5 h-3.5" />}
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching items</div>
            )}
          </div>
          {onManualClick && (
            <div 
              onClick={() => {
                onManualClick();
                setIsOpen(false);
              }}
              className="p-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              + Add Manually...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MasterDataForm: React.FC = () => {
  const { 
    processPlans,
    selectedNode, 
    setSelectedNode, 
    setIsFormOpen, 
    createProcessPlan, 
    createBeolOption, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    deleteProcessPlan,
    deleteBeolOption,
    // Lookups
    fetchProcessGroups,
    processGroups,
    loadingProcessGroups,
    fetchBeols,
    beols,
    loadingBeols
  } = useMasterData();

  const [isManualBeol, setIsManualBeol] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    if (selectedNode?.id !== -1 && selectedNode?.data) {
      return {
        designRule: selectedNode.data.designRule || '',
        optionName: selectedNode.data.optionName || '',
        partId: selectedNode.data.partId || '',
        productName: selectedNode.data.productName || '',
        metaInfo: {
          processId: selectedNode.data.metaInfo?.processId || '',
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

  // 1. Filter Process Groups: Exclude ones that already exist in processPlans
  const availableProcessGroups = React.useMemo(() => {
    const existingRules = new Set(processPlans.map(p => p.designRule));
    return processGroups.filter(grp => !existingRules.has(grp));
  }, [processGroups, processPlans]);

  // 2. Filter BEOL Options: Exclude ones that already exist under the selected ProcessPlan
  const availableBeols = React.useMemo(() => {
    if (selectedNode?.type !== 'option' || !selectedNode.data?.parentId) return beols;
    const parentPlan = processPlans.find(p => p.id === Number(selectedNode.data.parentId));
    const existingOptions = new Set(parentPlan?.beolOptions.map(o => o.optionName) || []);
    return beols.filter(beol => !existingOptions.has(beol));
  }, [beols, selectedNode, processPlans]);

  // Load process groups on mount if creating plan
  useEffect(() => {
    if (selectedNode?.type === 'plan' && selectedNode.id === -1) {
      fetchProcessGroups();
    }
  }, [selectedNode?.type, selectedNode?.id, fetchProcessGroups]);

  // Load beols when design rule is available (for option creation)
  useEffect(() => {
    if (selectedNode?.type === 'option' && selectedNode.id === -1 && selectedNode.data?.designRule) {
      fetchBeols({ variables: { processGrp: selectedNode.data.designRule } });
    }
  }, [selectedNode?.type, selectedNode?.id, selectedNode?.data?.designRule, fetchBeols]);

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
    if (!window.confirm(`Are you sure you want to delete this ${selectedNode.type}? All related sub-items will also be removed.`)) return;
    try {
      if (selectedNode.type === 'product') {
        await deleteProduct(Number(selectedNode.id));
      } else if (selectedNode.type === 'option') {
        await deleteBeolOption(Number(selectedNode.id));
      } else if (selectedNode.type === 'plan') {
        await deleteProcessPlan(Number(selectedNode.id));
      }
      setIsFormOpen(false);
      setSelectedNode(null);
    } catch (e) {
      alert('Error deleting: ' + e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-6 border-b border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-[0.2em] shadow-sm transition-all",
            mode === 'create' ? "bg-indigo-600 text-white shadow-indigo-600/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700"
          )}>
            {mode === 'create' ? 'Create' : 'Edit'} {selectedNode.type}
          </span>
        </div>
        {mode === 'edit' && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-[8px] font-black text-red-500 hover:bg-red-500/10 rounded-md transition-all uppercase tracking-[0.2em] active:scale-95"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-10 max-w-3xl mx-auto w-full space-y-10 scrollbar-hide">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2.5 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">
          {selectedNode.path.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-200 dark:text-slate-700" />}
              <span className={cn(i === selectedNode.path.length - 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')}>{p}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-8">
          {selectedNode.type === 'plan' && (
            <div className="space-y-3">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 flex justify-between">
                Design Rule (Process Group)
              </label>
              {mode === 'create' ? (
                <SearchableSelect 
                  value={formData.designRule}
                  options={availableProcessGroups}
                  onChange={(val) => setFormData({ ...formData, designRule: val })}
                  placeholder="Select a Process Group..."
                  loading={loadingProcessGroups}
                />
              ) : (
                <div className="w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-transparent rounded-md px-6 py-4 text-sm text-slate-900 dark:text-white font-black uppercase tracking-wider">
                  {formData.designRule}
                </div>
              )}
            </div>
          )}

          {selectedNode.type === 'option' && (
            <div className="space-y-3">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 flex justify-between">
                Option Name (BEOL)
              </label>
              {mode === 'create' ? (
                <div className="space-y-3">
                  {!isManualBeol ? (
                    <SearchableSelect 
                      value={formData.optionName}
                      options={availableBeols}
                      onChange={(val) => setFormData({ ...formData, optionName: val })}
                      placeholder="Select a BEOL Option..."
                      loading={loadingBeols}
                      onManualClick={() => {
                        setIsManualBeol(true);
                        setFormData({ ...formData, optionName: '' });
                      }}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={formData.optionName}
                        onChange={(e) => setFormData({ ...formData, optionName: e.target.value })}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 border-indigo-500/30 rounded-md px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600/50 transition-all font-bold shadow-sm"
                        placeholder="Type BEOL option name..."
                      />
                      <button
                        onClick={() => {
                          setIsManualBeol(false);
                          setFormData({ ...formData, optionName: '' });
                        }}
                        className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        Back to List
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-transparent rounded-md px-6 py-4 text-sm text-slate-900 dark:text-white font-black uppercase tracking-wider">
                  {formData.optionName}
                </div>
              )}
            </div>
          )}

          {selectedNode.type === 'product' && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Part ID</label>
                  <input
                    value={formData.partId}
                    disabled={mode === 'edit'}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-md px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600/50 transition-all font-bold disabled:opacity-30 placeholder:text-slate-300 dark:placeholder:text-slate-800 shadow-sm"
                    placeholder="e.g. S5E9925"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Product Name</label>
                  <input
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-md px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-slate-800 shadow-sm"
                    placeholder="e.g. Exynos 2200"
                  />
                </div>
              </div>

              <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/50 dark:bg-slate-950/40 space-y-8 shadow-sm transition-all">
                <h4 className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] transition-colors">Detailed Metadata</h4>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { key: 'processId', label: 'Process ID', type: 'text' },
                    { key: 'customer', label: 'Customer', type: 'text' },
                    { key: 'application', label: 'Application', type: 'text' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-3">
                      <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ml-1 transition-colors">{field.label}</label>
                      <input
                        type={field.type}
                        value={formData.metaInfo?.[field.key as keyof ProductMeta] as string || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaInfo: { ...formData.metaInfo, [field.key as keyof ProductMeta]: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-200 dark:placeholder:text-slate-800 shadow-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-5 pt-3">
                  {[
                    { key: 'chipSizeX', label: 'Chip Size X' },
                    { key: 'chipSizeY', label: 'Chip Size Y' },
                    { key: 'slSizeX', label: 'SL Size X' },
                    { key: 'slSizeY', label: 'SL Size Y' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-3">
                      <label className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ml-1 transition-colors">{field.label}</label>
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
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-5 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600/50 transition-all font-bold placeholder:text-slate-200 dark:placeholder:text-slate-800 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="p-6 border-t border-slate-200/60 dark:border-slate-800/50 flex gap-5 bg-slate-50/80 dark:bg-slate-950/20 backdrop-blur-sm transition-colors">
        <button
          onClick={() => {
            setIsFormOpen(false);
            setSelectedNode(null);
          }}
          className="px-6 py-4 text-[8px] font-black text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-all uppercase tracking-[0.3em]"
        >
          {mode === 'edit' && (selectedNode.type === 'plan' || selectedNode.type === 'option') ? 'Close' : 'Cancel'}
        </button>
        {!(mode === 'edit' && (selectedNode.type === 'plan' || selectedNode.type === 'option')) && (
          <button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-md text-[8px] font-black tracking-[0.4em] shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase"
          >
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        )}
      </footer>
    </div>
  );
};

export default MasterDataForm;
