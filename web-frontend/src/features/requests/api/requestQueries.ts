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

export const UPDATE_REQUEST_ITEM = gql`
  mutation UpdateRequestItem($id: Int!, $input: UpdateRequestItemInput!) {
    updateRequestItem(id: $id, input: $input) {
      id
      requestType
      title
      description
      edmList
      pkdVersions
      requesterId
      updatedAt
    }
  }
`;

export const DELETE_REQUEST_ITEM = gql`
  mutation DeleteRequestItem($id: Int!) {
    deleteRequestItem(id: $id) {
      id
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

export const GET_ALL_REQUESTS = gql`
  query GetAllRequests {
    requestItems {
      id
      requestType
      title
      description
      edmList
      pkdVersions
      requesterId
      createdAt
      updatedAt
      productId
    }
  }
`;
