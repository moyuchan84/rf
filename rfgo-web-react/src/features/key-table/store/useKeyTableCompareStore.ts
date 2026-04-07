import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface KeyTableCompareState {
  // Selection
  searchQuery: string;
  selectedTableName: string | null;
  selectedIds: number[];
  
  // Pagination config
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
  resetSelection: () => void;
}

export const useKeyTableCompareStore = create<KeyTableCompareState>()(
  devtools(
    (set) => ({
      searchQuery: '',
      selectedTableName: null,
      selectedIds: [],
      tableNamesPageSize: 20,
      compareTarget: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      
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

      resetSelection: () => set({ 
        selectedTableName: null, 
        selectedIds: [], 
        compareTarget: null,
        searchQuery: ''
      }),
    }),
    { name: 'KeyTableCompareStore' }
  )
);
