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
      assignees {
        id
        category
        userId
        userName
      }
      steps {
        id
        stepOrder
        stepName
        status
        workContent
        workerId
        completedAt
      }
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
      assignees {
        id
        category
        userId
        userName
      }
      steps {
        id
        stepOrder
        stepName
        status
        workContent
        workerId
        completedAt
      }
    }
  }
`;

export const GET_REQUEST_ITEM = gql`
  query GetRequestItem($id: Int!) {
    requestItem(id: $id) {
      id
      requestType
      title
      description
      edmList
      pkdVersions
      requesterId
      productId
      createdAt
      updatedAt
      assignees {
        id
        category
        userId
        userName
      }
      steps {
        id
        stepOrder
        stepName
        status
        workContent
        workerId
        completedAt
      }
    }
  }
`;

export const ASSIGN_USER = gql`
  mutation AssignUser($input: AssignUserInput!) {
    assignUser(input: $input) {
      id
      category
      userId
      userName
    }
  }
`;

export const REMOVE_ASSIGNEE = gql`
  mutation RemoveAssignee($id: Int!) {
    removeAssignee(id: $id) {
      id
    }
  }
`;

export const UPDATE_REQUEST_STEP = gql`
  mutation UpdateRequestStep($input: UpdateStepInput!) {
    updateRequestStep(input: $input) {
      id
      status
      workContent
      workerId
      completedAt
    }
  }
`;
