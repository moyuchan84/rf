import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Users, Briefcase, Loader2, History, X } from 'lucide-react';
import { useEmployeeSearch } from '../hooks/useEmployeeSearch';
import { useEmployeeStore, Employee } from '../store/useEmployeeStore';

interface EmployeeSearchProps {
  onSelect: (employee: Employee) => void;
  placeholder?: string;
  className?: string;
}

export const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ 
  onSelect, 
  placeholder = "Search by Name, Dept, or ID...",
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [condition, setCondition] = useState<'FullName' | 'Organization' | 'Title'>('FullName');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { employees, loading } = useEmployeeSearch(query, condition);
  const { recentSearches, addRecent, clearRecents } = useEmployeeStore();

  // Secondary filtering logic
  const filteredResults = React.useMemo(() => {
    if (!subFilter.trim()) return employees;
    const sf = subFilter.toLowerCase();
    return employees.filter(emp => 
      emp.userId?.toLowerCase().includes(sf) || 
      emp.departmentName?.toLowerCase().includes(sf) ||
      emp.fullName?.toLowerCase().includes(sf)
    );
  }, [employees, subFilter]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (emp: Employee) => {
    onSelect(emp);
    addRecent(emp);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex flex-col gap-2">
        {/* Search Input Group */}
        <div className="flex gap-1">
          <select 
            value={condition}
            onChange={(e) => setCondition(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 outline-none hover:border-indigo-500/50 transition-colors"
          >
            <option value="FullName">Name</option>
            <option value="Organization">Dept</option>
            <option value="Title">Title</option>
          </select>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md pl-9 pr-4 py-2 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <History className="w-3 h-3" /> Recent
                </span>
                <button onClick={clearRecents} className="text-[8px] font-bold text-slate-400 hover:text-red-500 transition-colors">Clear</button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((emp) => (
                  <button
                    key={`recent-${emp.userId}`}
                    onClick={() => handleSelect(emp)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-3 group"
                  >
                    <User className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{emp.fullName}</p>
                      <p className="text-[8px] text-slate-400 truncate">{emp.departmentName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
            {query.length >= 2 && (
              <React.Fragment>
                {/* Local Secondary Filter (Visible when many results) */}
                {employees.length > 5 && (
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="relative">
                      <input
                        type="text"
                        value={subFilter}
                        onChange={(e) => setSubFilter(e.target.value)}
                        placeholder="Filter results by ID or Dept..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-8 py-1.5 text-[9px] font-bold outline-none focus:border-indigo-500"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      {subFilter && (
                        <button onClick={() => setSubFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                          <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredResults.length > 0 ? (
                  filteredResults.map((emp) => (
                    <button
                      key={emp.userId}
                      onClick={() => handleSelect(emp)}
                      className="w-full text-left p-3 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-4 group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 my-0.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-900 transition-all shadow-sm">
                        <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">{emp.fullName}</p>
                          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm border border-indigo-100 dark:border-indigo-900/20">
                            {emp.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-500 transition-colors">
                            <Users className="w-3 h-3" />
                            <span className="text-[9px] font-bold truncate tracking-tight">{emp.departmentName}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  !loading && <div className="p-12 text-center flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-200 stroke-[1]" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No filtered results</p>
                  </div>
                )}
              </React.Fragment>
            )}
            
            {loading && employees.length === 0 && (
              <div className="p-8 flex items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Searching...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
