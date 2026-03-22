import React, { useState } from 'react';
import { Mail, ShieldCheck, Save, User, X } from 'lucide-react';
import { useSystemMailing } from '../hooks/useSystemMailing';
import { EmployeeSearch } from '@/features/employee/components/EmployeeSearch';
import { Employee } from '@/features/employee/store/useEmployeeStore';

export enum MailingCategory {
  REQUEST_NOTIFICATION = 'REQUEST_NOTIFICATION',
  SYSTEM_ERROR_NOTIFICATION = 'SYSTEM_ERROR_NOTIFICATION',
}

export const SystemMailingPage: React.FC = () => {
  const { mailers, isLoading, isUpdating, updateMailer } = useSystemMailing();
  const [selectedCategory, setSelectedCategory] = useState<MailingCategory>(MailingCategory.REQUEST_NOTIFICATION);
  const [editingRecipients, setEditingRecipients] = useState<Employee[]>([]);

  // Find current mailer when category changes or data loads
  React.useEffect(() => {
    const mailer = mailers.find(m => m.category === selectedCategory);
    setEditingRecipients(mailer?.recipients || []);
  }, [selectedCategory, mailers]);

  const handleAddRecipient = (employee: Employee) => {
    if (editingRecipients.some(e => e.userId === employee.userId)) return;
    setEditingRecipients([...editingRecipients, employee]);
  };

  const handleRemoveRecipient = (userId: string) => {
    setEditingRecipients(editingRecipients.filter(e => e.userId !== userId));
  };

  const handleSave = async () => {
    await updateMailer(selectedCategory, editingRecipients);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-md flex items-center justify-center shadow-md shadow-indigo-500/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">System Mailing</h1>
          <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></span>
            Global Default Recipients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mailing Categories</h3>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-2 shadow-sm space-y-1">
            {Object.values(MailingCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-md p-6 shadow-sm relative overflow-hidden group">
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Mail className="w-32 h-32" />
            </div>

            <div className="relative space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {selectedCategory.replace(/_/g, ' ')}
                  </h2>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Manage default recipients for this category
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Add Recipient */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search & Add Employee</label>
                <div className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md border border-slate-200/60 dark:border-slate-800 focus-within:border-indigo-500/50 transition-colors">
                  <EmployeeSearch 
                    onSelect={handleAddRecipient}
                    placeholder="Search by name, ID or department..."
                  />
                </div>
              </div>

              {/* Recipient List */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Assigned Recipients ({editingRecipients.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {editingRecipients.map((recipient) => (
                    <div 
                      key={recipient.userId}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-md group transition-all hover:border-indigo-500/30 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-md flex items-center justify-center border border-slate-200/60 dark:border-slate-700 shadow-sm">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                            {recipient.fullName}
                          </p>
                          <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold truncate uppercase tracking-tight">
                            {recipient.departmentName}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveRecipient(recipient.userId!)}
                        className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {editingRecipients.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-md bg-slate-50/10">
                      <Mail className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No default recipients configured</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
