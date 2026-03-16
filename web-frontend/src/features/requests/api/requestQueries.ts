import { gql } from '@apollo/client';

export const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      title
      description
      edmList
      pkdVersions
      requesterId
      createdAt
    }
  }
`;

export const GET_REQUESTS_BY_PRODUCT = gql`
  query GetRequestsByProduct($productId: Int!) {
    requestItemsByProduct(productId: $productId) {
      id
      title
      description
      edmList
      pkdVersions
      requesterId
      createdAt
      updatedAt
    }
  }
`;
