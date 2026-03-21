import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { SEARCH_EMPLOYEES } from '../api/employeeQueries';
import { Employee } from '../store/useEmployeeStore';

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface SearchEmployeesData {
  searchEmployees: {
    employees: Employee[];
    totalCount: number;
    result: string;
  };
}

export const useEmployeeSearch = (query: string, condition: 'FullName' | 'Organization' | 'Title') => {
  const debouncedQuery = useDebounce(query, 500);

  const { data, loading, error } = useQuery<SearchEmployeesData>(SEARCH_EMPLOYEES, {
    variables: {
      input: {
        query: debouncedQuery,
        condition,
      },
    },
    // Apollo Client uses 'skip' instead of 'enabled'
    skip: debouncedQuery.length < 2,
    fetchPolicy: 'cache-first',
  });

  return {
    employees: (data?.searchEmployees?.employees || []) as Employee[],
    totalCount: data?.searchEmployees?.totalCount || 0,
    loading,
    error,
  };
};
