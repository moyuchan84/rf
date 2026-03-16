import React, { useState } from 'react';
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

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-xl shadow-lg animate-in fade-in zoom-in duration-300">
    <span className="text-[10px] font-bold text-slate-200 max-w-[150px] truncate">{label}</span>
    <button 
      type="button"
      onClick={onRemove}
      className="text-slate-500 hover:text-red-400 transition-colors p-0.5 hover:bg-red-400/10 rounded-md"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

const RequestStepForm: React.FC = () => {
  const navigate = useNavigate();
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
    handleAddEdm,
    handleRemoveEdm,
    handleAddPdk,
    handleRemovePdk,
    submitRequest,
    resetForm
  } = useRequestForm();

  const [newEdm, setNewEdm] = useState('');
  const [newPdk, setNewPdk] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRequest();
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Master Data...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-20 text-center bg-red-500/5 rounded-[3rem] border border-red-500/20">
      <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-400 font-bold uppercase tracking-widest text-xs">Error loading data: {error.message}</p>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 rounded-[3rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] pointer-events-none animate-pulse"></div>
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Request Submitted!</h2>
        <p className="text-slate-400 font-bold mb-10 text-center max-w-md">Your Photo-Key request has been registered. Our team will review it shortly.</p>
        <button 
          onClick={resetForm}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] active:scale-95 flex items-center gap-3"
        >
          <Sparkles className="w-4 h-4" /> Create Another Request
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
    pkdVersions.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Selection Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(79,70,229,0.02)_50%,transparent_75%)] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Selection Steps</h3>
            <button 
              onClick={() => navigate('/master-data')}
              className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl text-indigo-400 transition-all active:scale-95 flex items-center gap-2 group shadow-lg"
              title="Add Missing Data"
            >
              <Database className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase">Add New Data</span>
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Step 1: Process Plan */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 ml-1">
                <Settings className="w-3 h-3" /> Step 1: Process Plan
              </label>
              <div className="relative group">
                <select 
                  value={selectedPlanId || ''} 
                  onChange={(e) => {
                    setSelectedPlanId(Number(e.target.value));
                    setSelectedOptionId(null);
                    setSelectedProductId(null);
                  }}
                  className="w-full px-5 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold text-sm focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-700 shadow-xl"
                >
                  <option value="">Select Process Plan</option>
                  {processPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.designRule}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Step 2: BEOL Option */}
            <div className={`space-y-3 transition-all duration-500 ${!selectedPlanId ? 'opacity-20 blur-[1px] pointer-events-none grayscale' : ''}`}>
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 ml-1">
                <Layers className="w-3 h-3" /> Step 2: BEOL Option
              </label>
              <div className="relative group">
                <select 
                  value={selectedOptionId || ''} 
                  onChange={(e) => {
                    setSelectedOptionId(Number(e.target.value));
                    setSelectedProductId(null);
                  }}
                  className="w-full px-5 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold text-sm focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-700 shadow-xl"
                >
                  <option value="">Select BEOL Option</option>
                  {selectedPlan?.beolOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.optionName}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Step 3: Product */}
            <div className={`space-y-3 transition-all duration-500 ${!selectedOptionId ? 'opacity-20 blur-[1px] pointer-events-none grayscale' : ''}`}>
              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2 ml-1">
                <Cpu className="w-3 h-3" /> Step 3: Product
              </label>
              <div className="relative group">
                <select 
                  value={selectedProductId || ''} 
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold text-sm focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-700 shadow-xl"
                >
                  <option value="">Select Product</option>
                  {selectedOption?.products.map((product) => (
                    <option key={product.id} value={product.id}>{product.productName} ({product.partId})</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Meta Info Display */}
        {selectedProduct && selectedProduct.metaInfo && (
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Cpu className="w-32 h-32 text-indigo-400" />
            </div>
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 relative z-10">
              <Info className="w-4 h-4" /> Product Metadata
            </h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Process ID</span>
                <p className="text-sm font-black text-white">{selectedProduct.metaInfo.processId || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <User className="w-2.5 h-2.5" /> Customer
                </span>
                <p className="text-sm font-black text-white">{selectedProduct.metaInfo.customer || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Application
                </span>
                <p className="text-sm font-black text-white">{selectedProduct.metaInfo.application || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> MTO Date
                </span>
                <p className="text-sm font-black text-white">
                  {selectedProduct.metaInfo.mtoDate ? new Date(selectedProduct.metaInfo.mtoDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chip Size (X/Y)</span>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-black text-white">{selectedProduct.metaInfo.chipSizeX?.toFixed(2) || '0'}</p>
                  <span className="text-[9px] font-bold text-slate-600">x</span>
                  <p className="text-sm font-black text-white">{selectedProduct.metaInfo.chipSizeY?.toFixed(2) || '0'}</p>
                  <span className="text-[8px] font-bold text-slate-600 ml-1">mm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SL Size (X/Y)</span>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-black text-white">{selectedProduct.metaInfo.slSizeX?.toFixed(2) || '0'}</p>
                  <span className="text-[9px] font-bold text-slate-600">x</span>
                  <p className="text-sm font-black text-white">{selectedProduct.metaInfo.slSizeY?.toFixed(2) || '0'}</p>
                  <span className="text-[8px] font-bold text-slate-600 ml-1">mm</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Form Panel */}
      <div className="lg:col-span-2">
        <div className={`bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12 shadow-2xl transition-all duration-700 relative overflow-hidden ${!selectedProductId ? 'opacity-30 blur-[2px] pointer-events-none grayscale scale-[0.98]' : 'scale-100'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex items-center gap-8 mb-12 relative z-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-in zoom-in duration-500">
              <Plus className="text-white w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-tighter">New Photo-Key Request</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-indigo-400" /> technical requirements submission
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                  <FileText className="w-3 h-3 text-indigo-400" /> Request Type
                </label>
                <div className="relative group">
                  <select 
                    value={requestType} 
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full px-7 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold text-sm focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-700 shadow-xl"
                    required
                  >
                    <option value="">Select Request Type</option>
                    <option value="RFG(신규/변경) 의뢰">RFG(신규/변경) 의뢰</option>
                    <option value="RFG 개별 제품 Revision 의뢰">RFG 개별 제품 Revision 의뢰</option>
                    <option value="RFG 개별 제품 Revision 의뢰(Special)">RFG 개별 제품 Revision 의뢰(Special)</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-hover:text-indigo-400 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                  <User className="w-3 h-3 text-indigo-400" /> Requester ID
                </label>
                <input 
                  type="text" 
                  value={requesterId}
                  readOnly
                  className="w-full px-7 py-5 bg-slate-900/50 border-2 border-slate-800 rounded-2xl text-slate-400 font-bold text-sm outline-none cursor-not-allowed shadow-xl"
                  title="Auto-populated via SSO"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                <FileText className="w-3 h-3 text-indigo-400" /> Request Title
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Photo-Key design for Product A Rev 2"
                className="w-full px-7 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 shadow-xl"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                <Info className="w-3 h-3 text-indigo-400" /> Description & Requirements
              </label>
              <div className="bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
                <ReactQuill 
                  theme="snow" 
                  value={description} 
                  onChange={setDescription}
                  placeholder="Detail the request specifications, constraints, and any other relevant info..."
                  className="text-white font-medium"
                />
              </div>
              <style>{`
                .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #1e293b; padding: 12px 20px; background: #0f172a; }
                .ql-container.ql-snow { border: none; height: 200px; font-size: 14px; font-family: inherit; }
                .ql-editor { padding: 20px 25px; color: #f1f5f9; }
                .ql-editor.ql-blank::before { color: #334155; font-style: normal; font-weight: 700; opacity: 1; }
                .ql-snow .ql-stroke { stroke: #94a3b8; }
                .ql-snow .ql-fill { fill: #94a3b8; }
                .ql-snow .ql-picker { color: #94a3b8; }
              `}</style>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* EDM List Management */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                  <ExternalLink className="w-3 h-3 text-indigo-400" /> EDM Links
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newEdm}
                    onChange={(e) => setNewEdm(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-6 py-4 bg-slate-950 border-2 border-slate-800 rounded-xl text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all shadow-lg"
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
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl transition-all active:scale-90 shadow-xl border border-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={!newEdm.startsWith('http')}
                  >
                    <PlusCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                  {edmList.map((edm, index) => (
                    <Chip key={index} label={edm} onRemove={() => handleRemoveEdm(edm)} />
                  ))}
                  {edmList.length === 0 && <span className="text-[10px] font-bold text-slate-700 uppercase italic ml-1">No links added</span>}
                </div>
              </div>

              {/* PDK List Management */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 ml-1">
                  <Settings className="w-3 h-3 text-indigo-400" /> PDK Versions
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newPdk}
                    onChange={(e) => setNewPdk(e.target.value)}
                    placeholder="e.g. V1.0.4"
                    className="flex-1 px-6 py-4 bg-slate-950 border-2 border-slate-800 rounded-xl text-white font-bold text-xs focus:border-indigo-500 outline-none transition-all shadow-lg"
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
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl transition-all active:scale-90 shadow-xl border border-slate-700/50"
                  >
                    <PlusCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
                  {pkdVersions.map((v, index) => (
                    <Chip key={index} label={v} onRemove={() => handleRemovePdk(v)} />
                  ))}
                  {pkdVersions.length === 0 && <span className="text-[10px] font-bold text-slate-700 uppercase italic ml-1">No versions added</span>}
                </div>
              </div>
            </div>

            <div className="pt-10">
              <button 
                type="submit"
                className="group w-full py-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] transition-all shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] flex items-center justify-center gap-6 active:scale-[0.99] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none overflow-hidden relative"
                disabled={!isFormValid}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Submit Request <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestStepForm;
