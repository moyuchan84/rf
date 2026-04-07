import { useLazyQuery, useQuery } from '@apollo/client/react';
import { SEARCH_PHOTO_KEYS, GET_UNIQUE_TABLE_NAMES } from '../api/keyTableQueries';
import { PhotoKey } from '../../master-data/types';
import { useKeyTableCompareStore } from '../store/useKeyTableCompareStore';
import { useMemo, useEffect } from 'react';

interface PaginatedTableNames {
  items: string[];
  totalCount: number;
}

export const useTableCompare = () => {
  const { 
    searchQuery, 
    selectedTableName, 
    selectedIds,
    tableNamesPage,
    tableNamesPageSize,
    setCompareTarget,
    toggleIdSelection,
    setSelectedTableName,
    setSearchQuery,
    setTableNamesPage
  } = useKeyTableCompareStore();

  // 1. Fetch unique table names with server-side pagination and search
  const { data: namesData, loading: loadingNames } = useQuery<{ uniqueTableNames: PaginatedTableNames }>(GET_UNIQUE_TABLE_NAMES, {
    variables: {
      skip: 0, // Always start from 0 for the first fetch or when search changes
      take: tableNamesPageSize * (tableNamesPage + 1), // Fetch up to current page
      search: searchQuery
    },
    notifyOnNetworkStatusChange: true,
  });

  // 2. Lazy query for fetching details of a specific table
  const [fetchTableDetails, { data: searchData, loading: loadingRevisions }] = useLazyQuery<{ searchPhotoKeys: PhotoKey[] }>(SEARCH_PHOTO_KEYS);

  // Fetch revisions when a table is selected
  useEffect(() => {
    if (selectedTableName) {
      fetchTableDetails({ variables: { query: selectedTableName } });
    }
  }, [selectedTableName, fetchTableDetails]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // setTableNamesPage(0) is already handled in setSearchQuery action
  };

  const loadMore = () => {
    if (namesData && namesData.uniqueTableNames.items.length < namesData.uniqueTableNames.totalCount) {
      setTableNamesPage(tableNamesPage + 1);
    }
  };

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
    tableNames: namesData?.uniqueTableNames.items || [],
    totalTableCount: namesData?.uniqueTableNames.totalCount || 0,
    loadingNames,
    selectedTableName,
    setSelectedTableName,
    searchQuery,
    setSearchQuery: handleSearch,
    tableRevisions,
    loadingRevisions,
    selectedIds,
    toggleIdSelection,
    executeCompare,
    loadMore,
    hasMore: namesData ? namesData.uniqueTableNames.items.length < namesData.uniqueTableNames.totalCount : false
  };
};
