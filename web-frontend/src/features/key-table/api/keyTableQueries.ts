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
      updateDate
      productId
      processPlanId
      beolOptionId
      workbookData
    }
  }
`;
