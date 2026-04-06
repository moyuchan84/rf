import { useLazyQuery, useQuery } from '@apollo/client/react';
import { SEARCH_PHOTO_KEYS, GET_UNIQUE_TABLE_NAMES } from '../api/keyTableQueries';
import { PhotoKey } from '../../master-data/types';
import { useKeyTableCompareStore } from '../store/useKeyTableCompareStore';
import { useMemo, useEffect } from 'react';

export const useTableCompare = () => {
  const { 
    searchQuery, 
    selectedTableName, 
    selectedIds,
    setCompareTarget,
    toggleIdSelection,
    setSelectedTableName,
    setSearchQuery
  } = useKeyTableCompareStore();

  // 1. Fetch all unique table names for the sidebar/select list
  const { data: namesData, loading: loadingNames } = useQuery<{ uniqueTableNames: string[] }>(GET_UNIQUE_TABLE_NAMES);

  // 2. Lazy query for searching/fetching details of a specific table or searching by query
  const [search, { data: searchData, loading: loadingSearch }] = useLazyQuery<{ searchPhotoKeys: PhotoKey[] }>(SEARCH_PHOTO_KEYS);

  // Initial fetch when a table is selected
  useEffect(() => {
    if (selectedTableName) {
      search({ variables: { query: selectedTableName } });
    }
  }, [selectedTableName, search]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      search({ variables: { query } });
    }
  };

  const filteredTableNames = useMemo(() => {
    const allNames = namesData?.uniqueTableNames || [];
    if (!searchQuery) return allNames;
    return allNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [namesData, searchQuery]);

  const tableRevisions = useMemo(() => {
    if (!selectedTableName || !searchData) return [];
    return searchData.searchPhotoKeys
      .filter(pk => pk.tableName === selectedTableName)
      .sort((a, b) => (b.revNo || 0) - (a.revNo || 0));
  }, [searchData, selectedTableName]);

  const executeCompare = () => {
    if (selectedIds.length === 2 && selectedTableName) {
      const base = tableRevisions.find(v => v.id === selectedIds[0]);
      const target = tableRevisions.find(v => v.id === selectedIds[1]);
      if (base && target) {
        const [sortedBase, sortedTarget] = (base.revNo || 0) < (target.revNo || 0) ? [base, target] : [target, base];
        setCompareTarget({
          baseId: sortedBase.id,
          targetId: sortedTarget.id,
          baseTitle: `${sortedBase.tableName} (Rev.${sortedBase.revNo})`,
          targetTitle: `${sortedTarget.tableName} (Rev.${sortedTarget.revNo})`
        });
      }
    }
  };

  return {
    tableNames: filteredTableNames,
    loadingNames,
    selectedTableName,
    setSelectedTableName,
    searchQuery,
    setSearchQuery: handleSearch,
    tableRevisions,
    loadingRevisions: loadingSearch,
    selectedIds,
    toggleIdSelection,
    executeCompare
  };
};
