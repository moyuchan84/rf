import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const COMPARE_PHOTO_KEYS = gql`
  query ComparePhotoKeys($baseId: Int!, $targetId: Int!) {
    comparePhotoKeys(baseId: $baseId, targetId: $targetId) {
      sheetName
      status
      diffRows {
        status
        data
        baseData
        changedFields
      }
    }
  }
`;

export interface DiffRow {
  status: 'unchanged' | 'added' | 'removed' | 'modified';
  data: any;
  baseData?: any;
  changedFields?: string[];
}

export interface SheetDiff {
  sheetName: string;
  status: 'unchanged' | 'added' | 'removed' | 'modified';
  diffRows?: DiffRow[];
}

export const usePhotoKeyDiff = (baseId?: number, targetId?: number) => {
  const { data, loading, error } = useQuery<{ comparePhotoKeys: SheetDiff[] }>(COMPARE_PHOTO_KEYS, {
    variables: { baseId, targetId },
    skip: !baseId || !targetId,
  });

  return {
    diff: data?.comparePhotoKeys,
    loading,
    error,
  };
};
