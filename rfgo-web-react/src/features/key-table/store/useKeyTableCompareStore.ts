import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface KeyTableCompareState {
  // Selection
  searchQuery: string;
  selectedTableName: string | null;
  selectedIds: number[];
  
  // Pagination
  tableNamesPage: number;
  tableNamesPageSize: number;

  // Results for Comparison
  compareTarget: {
    baseId: number;
    targetId: number;
    baseTitle: string;
    targetTitle: string;
  } | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTableName: (name: string | null) => void;
  setSelectedIds: (ids: number[]) => void;
  toggleIdSelection: (id: number) => void;
  setCompareTarget: (target: KeyTableCompareState['compareTarget']) => void;
  setTableNamesPage: (page: number) => void;
  resetSelection: () => void;
}

export const useKeyTableCompareStore = create<KeyTableCompareState>()(
  devtools(
    (set) => ({
      searchQuery: '',
      selectedTableName: null,
      selectedIds: [],
      tableNamesPage: 0,
      tableNamesPageSize: 20,
      compareTarget: null,

      setSearchQuery: (query) => set({ searchQuery: query, tableNamesPage: 0 }),
      
      setSelectedTableName: (name) => set({ 
        selectedTableName: name, 
        selectedIds: [] 
      }),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      toggleIdSelection: (id) => set((state) => {
        if (state.selectedIds.includes(id)) {
          return { selectedIds: state.selectedIds.filter(i => i !== id) };
        }
        if (state.selectedIds.length >= 2) {
          return { selectedIds: [state.selectedIds[1], id] };
        }
        return { selectedIds: [...state.selectedIds, id] };
      }),

      setCompareTarget: (target) => set({ compareTarget: target }),

      setTableNamesPage: (page) => set({ tableNamesPage: page }),

      resetSelection: () => set({ 
        selectedTableName: null, 
        selectedIds: [], 
        compareTarget: null,
        tableNamesPage: 0,
        searchQuery: ''
      }),
    }),
    { name: 'KeyTableCompareStore' }
  )
);
