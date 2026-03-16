import { gql } from '@apollo/client';

export const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      requestType
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
      requestType
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
