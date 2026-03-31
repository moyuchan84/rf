import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Plus, 
  ArrowRight, 
  ExternalLink, 
  Info, 
  User, 
  FileText, 
  Layers, 
  Cpu, 
  Settings,
  X,
  CheckCircle2,
  PlusCircle,
  Database,
  Calendar,
  Globe,
  Sparkles
} from 'lucide-react';
import { useRequestForm } from '../hooks/useRequestForm';
import { useUserStore } from '../../auth/store/useUserStore';
import { type RequestItem } from '../../master-data/types';
import { REQUEST_TYPE_OPTIONS } from '../types';
import { MailSelector } from '../../mailing/components/MailSelector';
import { EmployeeDto } from '../../mailing/store/useMailSelectorStore';

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 px-2 py-1 rounded-md shadow-sm dark:shadow-lg animate-in fade-in zoom-in duration-300 transition-all">
    <span className="text-[8px] font-bold text-slate-600 dark:text-slate-200 max-w-[120px] truncate transition-colors">{label}</span>
    <button 
      type="button"
      onClick={onRemove}
      className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 hover:bg-red-500/10 rounded-sm"
    >
      <X className="w-2.5 h-2.5" />
    </button>
  </div>
);

interface RequestStepFormProps {
  initialData?: RequestItem | null;
  onSuccess?: () => void;
}

const RequestStepForm: React.FC<RequestStepFormProps> = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    processPlans,
    loading,
    error,
    selectedPlanId,
    selectedOptionId,
    selectedProductId,
    selectedPlan,
    selectedOption,
    selectedProduct,
    requestType,
    title,
    description,
    mtoDate,
    layoutRequestDescription,
    requesterId,
    edmList,
    pkdVersions,
    isSubmitted,
    setSelectedPlanId,
    setSelectedOptionId,
    setSelectedProductId,
    setRequestType,
    setTitle,
    setDescription,
    setMtoDate,
    setLayoutRequestDescription,
    setRequesterId,
    handleAddEdm,
    handleRemoveEdm,
    handleAddPdk,
    handleRemovePdk,
    submitRequest,
    resetForm
  } = useRequestForm(initialData);

  const [newEdm, setNewEdm] = useState('');
  const [newPdk, setNewPdk] = useState('');

  // Auto-populate requesterId from logged-in user
  useEffect(() => {
    if (user?.userId && !initialData) {
      setRequesterId(user.userId);
    }
  }, [user, initialData, setRequesterId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always include requester in watchers list
    const requesterDto: EmployeeDto | null = user ? {
      epId: user.epId,
      fullName: user.fullName,
      userId: user.userId,
      departmentName: user.deptName,
      emailAddress: user.email,
    } : null;

    await submitRequest(requesterDto);
    if (onSuccess) onSuccess();
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Master Data...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-20 text-center bg-red-500/5 rounded-md border border-red-500/20">
      <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-400 font-bold uppercase tracking-widest text-xs">Error loading data: {error.message}</p>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900/50 rounded-md border border-indigo-500/30 dark:border-indigo-500/30 shadow-sm dark:shadow-xl relative overflow-hidden transition-all">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] pointer-events-none animate-pulse"></div>
        <div className="w-20 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-md flex items-center justify-center mb-6 border border-green-500/30 dark:border-green-500/50 shadow-sm dark:shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter transition-colors">Request Submitted!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 text-center max-w-sm transition-colors">Your Photo-Key request has been registered. Our team will review it shortly.</p>
        <button 
          onClick={resetForm}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Create Another Request
        </button>
      </div>
    );
  }

  const isFormValid = 
    selectedProductId && 
    requestType && 
    title.trim() && 
    description.replace(/<[^>]*>/g, '').trim() && 
    edmList.length > 0 && 
    pkdVersions.length > 0 &&
    requesterId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      {/* Selection Panel */}
      <div className="lg:col-span-1 space-y-5">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-all">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(79,70,229,0.01)_50%,transparent_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(79,70,229,0.02)_50%,transparent_75%)] pointer-events-none transition-all"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">Selection Steps</h3>
            <button 
              onClick={() => navigate('/master-data')}
              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/20 rounded-md text-indigo-600 dark:text-indigo-400 transition-all active:scale-95 flex items-center gap-1.5 group shadow-sm"
              title="Add Missing Data"
            >
              <Database className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase">Add New Data</span>
            </button>
          </div>

          <div className="space-y-5 relative z-10">
            {/* Step 1: Process Plan */}
            <div className="space-y-2.5">
              <label className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <Settings className="w-2.5 h-2.5" /> Step 1: Process Plan
              </label>
              <div className="relative group">
                <select 
                  value={selectedPlanId || ''} 
                  onChange={(e) => {
                    setSelectedPlanId(Number(e.target.value));
                    setSelectedOptionId(null);
                    setSelectedProductId(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                >
                  <option value="">Select Process Plan</option>
                  {processPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.designRule}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Step 2: BEOL Option */}
            <div className={`space-y-2.5 transition-all duration-500 ${!selectedPlanId ? 'opacity-20 blur-[1px] pointer-events-none grayscale' : ''}`}>
              <label className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <Layers className="w-2.5 h-2.5" /> Step 2: BEOL Option
              </label>
              <div className="relative group">
                <select 
                  value={selectedOptionId || ''} 
                  onChange={(e) => {
                    setSelectedOptionId(Number(e.target.value));
                    setSelectedProductId(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                >
                  <option value="">Select BEOL Option</option>
                  {selectedPlan?.beolOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.optionName}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Step 3: Product */}
            <div className={`space-y-2.5 transition-all duration-500 ${!selectedOptionId ? 'opacity-20 blur-[1px] pointer-events-none grayscale' : ''}`}>
              <label className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <Cpu className="w-2.5 h-2.5" /> Step 3: Product
              </label>
              <div className="relative group">
                <select 
                  value={selectedProductId || ''} 
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                >
                  <option value="">Select Product</option>
                  {selectedOption?.products.map((product) => (
                    <option key={product.id} value={product.id}>{product.productName} ({product.partId})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Meta Info Display */}
        {selectedProduct && selectedProduct.metaInfo && (
          <div className="bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-100 dark:border-indigo-500/20 rounded-md p-6 shadow-sm dark:shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-[0.05] dark:opacity-[0.03] transition-opacity">
              <Cpu className="w-24 h-24 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-1.5 relative z-10 transition-colors">
              <span className="p-1 bg-indigo-600 text-white rounded-md shadow-md">
                <Info className="w-3 h-3" />
              </span>
              Product Metadata
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-3 relative z-10">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Process ID</span>
                <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.processId || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <User className="w-2 h-2" /> Customer
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.customer || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <Globe className="w-2 h-2" /> Application
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.application || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Chip Size (X/Y)</span>
                <div className="flex items-baseline gap-0.5">
                  <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.chipSizeX?.toFixed(2) || '0'}</p>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 transition-colors">x</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.chipSizeY?.toFixed(2) || '0'}</p>
                  <span className="text-[7px] font-bold text-slate-400 dark:text-slate-600 ml-0.5 transition-colors">mm</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">SL Size (X/Y)</span>
                <div className="flex items-baseline gap-0.5">
                  <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.slSizeX?.toFixed(2) || '0'}</p>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 transition-colors">x</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white transition-colors">{selectedProduct.metaInfo.slSizeY?.toFixed(2) || '0'}</p>
                  <span className="text-[7px] font-bold text-slate-400 dark:text-slate-600 ml-0.5 transition-colors">mm</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Form Panel */}
      <div className="lg:col-span-2">
        <div className={`bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-10 shadow-sm dark:shadow-xl transition-all duration-700 relative overflow-hidden ${!selectedProductId ? 'opacity-30 blur-[2px] pointer-events-none grayscale scale-[0.98]' : 'scale-100'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] dark:bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all"></div>
          
          <div className="flex items-center gap-6 mb-10 relative z-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-indigo-600/20 animate-in zoom-in duration-500">
              <Plus className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-tighter transition-colors">New Request</h2>
              <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-1.5 transition-colors">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> technical requirements submission
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                  <FileText className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Request Type
                </label>
                <div className="relative group">
                  <select 
                    value={requestType} 
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                    required
                  >
                    <option value="">Select Request Type</option>
                    {REQUEST_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                  <User className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Requester
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={user ? `${user.fullName} (${user.userId})` : requesterId}
                    readOnly
                    className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-slate-500 dark:text-slate-400 font-bold text-xs outline-none cursor-not-allowed shadow-sm transition-colors"
                    title="Auto-populated via SSO"
                  />
                  {user && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[8px] text-green-600 dark:text-green-400 font-black uppercase tracking-tighter">Verified</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <FileText className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Request Title
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Photo-Key design for Product A Rev 2"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                  <Calendar className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> MTO Date
                </label>
                <input 
                  type="date" 
                  value={mtoDate}
                  onChange={(e) => setMtoDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <Info className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Description & Requirements
              </label>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm dark:shadow-xl focus-within:border-indigo-500/50 transition-all">
                <ReactQuill 
                  theme="snow" 
                  value={description} 
                  onChange={setDescription}
                  placeholder="Detail the request specifications, constraints, and any other relevant info..."
                  className="text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                <FileText className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Layout Description (Optional)
              </label>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm dark:shadow-xl focus-within:border-indigo-500/50 transition-all">
                <ReactQuill 
                  theme="snow" 
                  value={layoutRequestDescription} 
                  onChange={setLayoutRequestDescription}
                  placeholder="Additional layout requirements, special constraints..."
                  className="text-slate-900 dark:text-white font-medium"
                />
              </div>
              <style>{`
                .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid var(--ql-border-color); padding: 10px 16px; background: var(--ql-toolbar-bg); transition: all 0.3s; }
                .ql-container.ql-snow { border: none; height: 160px; font-size: 13px; font-family: inherit; transition: all 0.3s; }
                .ql-editor { padding: 16px 20px; color: var(--ql-text-color); transition: color 0.3s; }
                .ql-editor.ql-blank::before { color: var(--ql-placeholder-color); font-style: normal; font-weight: 700; opacity: 1; }
                .ql-snow .ql-stroke { stroke: var(--ql-stroke-color); transition: stroke 0.3s; }
                .ql-snow .ql-fill { fill: var(--ql-stroke-color); transition: fill 0.3s; }
                .ql-snow .ql-picker { color: var(--ql-stroke-color); transition: color 0.3s; }
                
                :root {
                  --ql-border-color: #e2e8f0;
                  --ql-toolbar-bg: #f8fafc;
                  --ql-text-color: #0f172a;
                  --ql-placeholder-color: #94a3b8;
                  --ql-stroke-color: #64748b;
                }
                .dark {
                  --ql-border-color: #1e293b;
                  --ql-toolbar-bg: #0f172a;
                  --ql-text-color: #f1f5f9;
                  --ql-placeholder-color: #334155;
                  --ql-stroke-color: #94a3b8;
                }
              `}</style>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* EDM List Management */}
              <div className="space-y-3">
                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                  <ExternalLink className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> EDM Links
                </label>
                <div className="flex gap-2.5">
                  <input 
                    type="text" 
                    value={newEdm}
                    onChange={(e) => setNewEdm(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-[10px] focus:border-indigo-500 outline-none transition-all shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newEdm.startsWith('http')) {
                          handleAddEdm(newEdm);
                          setNewEdm('');
                        }
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newEdm.startsWith('http')) {
                        handleAddEdm(newEdm);
                        setNewEdm('');
                      }
                    }}
                    className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-md transition-all active:scale-90 shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={!newEdm.startsWith('http')}
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5 min-h-[32px]">
                  {edmList.map((edm, index) => (
                    <Chip key={index} label={edm} onRemove={() => handleRemoveEdm(edm)} />
                  ))}
                  {edmList.length === 0 && <span className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase italic ml-1 transition-colors">No links added</span>}
                </div>
              </div>

              {/* PDK List Management */}
              <div className="space-y-3">
                <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5 ml-1 transition-colors">
                  <Settings className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> PDK Versions
                </label>
                <div className="flex gap-2.5">
                  <input 
                    type="text" 
                    value={newPdk}
                    onChange={(e) => setNewPdk(e.target.value)}
                    placeholder="e.g. V1.0.4"
                    className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white font-bold text-[10px] focus:border-indigo-500 outline-none transition-all shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPdk(newPdk);
                        setNewPdk('');
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      handleAddPdk(newPdk);
                      setNewPdk('');
                    }}
                    className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-md transition-all active:scale-90 shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5 min-h-[32px]">
                  {pkdVersions.map((v, index) => (
                    <Chip key={index} label={v} onRemove={() => handleRemovePdk(v)} />
                  ))}
                  {pkdVersions.length === 0 && <span className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase italic ml-1 transition-colors">No versions added</span>}
                </div>
              </div>
            </div>

            {/* Mailing List Selection */}
            <div className="space-y-3">
              <MailSelector />
            </div>

            <div className="pt-8">
              <button 
                type="submit"
                className="group w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-black text-xs uppercase tracking-[0.5em] transition-all shadow-md shadow-indigo-600/30 dark:shadow-xl flex items-center justify-center gap-5 active:scale-[0.99] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none overflow-hidden relative"
                disabled={!isFormValid}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Submit Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
};

export default RequestStepForm;
