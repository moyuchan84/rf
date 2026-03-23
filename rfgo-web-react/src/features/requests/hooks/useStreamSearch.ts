import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { SEARCH_PHOTO_KEYS_BY_STREAM } from '../api/requestQueries';
import { PhotoKey } from '@/features/master-data/types';
import { useReferenceTableStore } from '../store/useReferenceTableStore';

export const useStreamSearch = () => {
  const [query, setQuery] = useState('');
  const { setAvailableKeys } = useReferenceTableStore();
  
  const [search, { loading, data, error }] = useLazyQuery<{ searchPhotoKeysByStream: PhotoKey[] }, { query: string }>(
    SEARCH_PHOTO_KEYS_BY_STREAM, 
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (data?.searchPhotoKeysByStream) {
      setAvailableKeys(data.searchPhotoKeysByStream);
    }
  }, [data, setAvailableKeys]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        search({ variables: { query } });
      } else if (query.trim().length === 0) {
        setAvailableKeys([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, search, setAvailableKeys]);

  return {
    query,
    setQuery,
    loading,
    error,
    results: data?.searchPhotoKeysByStream || []
  };
};
