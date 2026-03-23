import React from 'react';
import { X, Table, FileText, Calendar, User, Hash } from 'lucide-react';
import { PhotoKey } from '@/features/master-data/types';

interface PhotoKeyPreviewModalProps {
  table: PhotoKey;
  onClose: () => void;
}

export const PhotoKeyPreviewModal: React.FC<PhotoKeyPreviewModalProps> = ({ table, onClose }) => {
  const wb = table.workbookData as any;
  const meta = wb?.workbook_meta;
  const sheet = wb?.worksheets?.[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-full rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Table className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{table.tableName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-sm">REV {table.revNo}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {table.filename}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-md transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Category', value: table.rfgCategory, icon: Hash },
              { label: 'Photo Cat', value: table.photoCategory, icon: Hash },
              { label: 'Updater', value: table.updater || 'System', icon: User },
              { label: 'Update Date', value: new Date(table.updateDate).toLocaleDateString(), icon: Calendar },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-md">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3" /> {item.label}
                </p>
                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Table Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                Table Data Preview ({sheet?.sheet_name || 'Main'})
              </h4>
              <span className="text-[9px] font-bold text-slate-400 italic">Showing first {sheet?.rows?.length || 0} rows</span>
            </div>

            <div className="border border-slate-100 dark:border-slate-800 rounded-md overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    {sheet?.meta?.alias_map && Object.values(sheet.meta.alias_map).map((alias: any, idx: number) => (
                      <th key={idx} className="p-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {alias.split(';')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sheet?.rows?.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      {Object.keys(sheet.meta.alias_map).map((colKey, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {row[colKey]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Close Preview
          </button>
        </footer>
      </div>
    </div>
  );
};
