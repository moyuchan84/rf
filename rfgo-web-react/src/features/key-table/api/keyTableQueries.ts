import { gql } from '@apollo/client';

export const GET_PHOTO_KEYS = gql`
  query GetPhotoKeys($productId: Int, $beolOptionId: Int, $processPlanId: Int) {
    photoKeys(productId: $productId, beolOptionId: $beolOptionId, processPlanId: $processPlanId) {
      id
      tableName
      revNo
      rfgCategory
      photoCategory
      isReference
      filename
      log
      updateDate
      productId
      processPlanId
      beolOptionId
      workbookData
    }
  }
`;

export const SEARCH_PHOTO_KEYS = gql`
  query SearchPhotoKeys($query: String!) {
    searchPhotoKeys(query: $query) {
      id
      tableName
      revNo
      photoCategory
      filename
      updateDate
    }
  }
`;

export const GET_UNIQUE_TABLE_NAMES = gql`
  query GetUniqueTableNames {
    uniqueTableNames
  }
`;
