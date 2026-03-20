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
        requestId
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
        requestId
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
        requestId
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

export const GET_PHOTO_KEYS_FOR_REQUEST = gql`
  query GetPhotoKeysForRequest($productId: Int, $beolOptionId: Int, $processPlanId: Int) {
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

export const CREATE_STREAM_INFO = gql`
  mutation CreateStreamInfo($input: CreateStreamInfoInput!) {
    createStreamInfo(input: $input) {
      id
      streamPath
      streamInputOutputFile
    }
  }
`;

export const GET_STREAM_INFOS_BY_PRODUCT = gql`
  query GetStreamInfosByProduct($productId: Int!) {
    streamInfosByProduct(productId: $productId) {
      id
      requestId
      streamPath
      streamInputOutputFile
    }
  }
`;

export const GET_STREAM_INFO_BY_REQUEST = gql`
  query GetStreamInfoByRequest($requestId: Int!) {
    streamInfoByRequest(requestId: $requestId) {
      id
      streamPath
      streamInputOutputFile
    }
  }
`;

export const SAVE_REQUEST_TABLES = gql`
  mutation SaveRequestTables($input: SaveRequestTablesInput!) {
    saveRequestTables(input: $input) {
      id
      photoKeyId
      type
    }
  }
`;

export const GET_REQUEST_TABLES = gql`
  query GetRequestTables($requestId: Int!, $type: String!) {
    requestTables(requestId: $requestId, type: $type) {
      id
      photoKeyId
      type
    }
  }
`;
