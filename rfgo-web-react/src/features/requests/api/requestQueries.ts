import { gql } from '@apollo/client';

export const CREATE_GDS_PATH_INFO = gql`
  mutation CreateGdsPathInfo($input: CreateGdsPathInfoInput!) {
    createGdsPathInfo(input: $input) {
      id
      gdsPathList
    }
  }
`;

export const GET_GDS_PATH_INFO_BY_REQUEST = gql`
  query GetGdsPathInfoByRequest($requestId: Int!) {
    gdsPathInfoByRequest(requestId: $requestId) {
      id
      gdsPathList
    }
  }
`;

export const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      requestType
      title
      description
      mtoDate
      layoutRequestDescription
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
      mtoDate
      layoutRequestDescription
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
      mtoDate
      layoutRequestDescription
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
        user
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
  query GetAllRequests($search: String, $skip: Int, $take: Int, $requestType: String, $processPlanId: Int, $beolOptionId: Int) {
    requestItems(search: $search, skip: $skip, take: $take, requestType: $requestType, processPlanId: $processPlanId, beolOptionId: $beolOptionId) {
      items {
        id
        requestType
        title
        description
        mtoDate
        layoutRequestDescription
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
          user
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
        product {
          id
          partId
          productName
          metaInfo {
            id
            processId
            customer
            application
            chipSizeX
            chipSizeY
            slSizeX
            slSizeY
          }
          beolOption {
            id
            optionName
            beolGroup {
              id
              groupName
            }
            processPlan {
              id
              designRule
            }
          }
        }
      }
      totalCount
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
      mtoDate
      layoutRequestDescription
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
        user
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
      product {
        id
        partId
        productName
        metaInfo {
          id
          processId
          customer
          application
          chipSizeX
          chipSizeY
          slSizeX
          slSizeY
        }
        beolOption {
          id
          optionName
          beolGroup {
            id
            groupName
          }
          processPlan {
            id
            designRule
          }
        }
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
      user
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
  query GetPhotoKeysForRequest($productId: Int, $beolOptionId: Int, $beolGroupId: Int, $processPlanId: Int) {
    photoKeys(productId: $productId, beolOptionId: $beolOptionId, beolGroupId: $beolGroupId, processPlanId: $processPlanId) {
      id
      tableName
      revNo
      rfgCategory
      photoCategory
      isReference
      filename
      updateDate
      productId
      product {
        id
        partId
        productName
      }
      processPlanId
      beolGroupId
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
      request {
        id
        title
      }
    }
  }
`;

export const GET_STREAM_INFOS_BY_BEOL_OPTION = gql`
  query GetStreamInfosByBeolOption($beolGroupId: Int!) {
    streamInfosByBeolOption(beolGroupId: $beolGroupId) {
      id
      requestId
      streamPath
      streamInputOutputFile
      productId
      product {
        id
        partId
        productName
      }
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
      photoKey {
        id
        tableName
        revNo
        rfgCategory
        photoCategory
        isReference
        filename
        updateDate
        productId
        product {
          id
          partId
          productName
        }
        processPlanId
        beolGroupId
        beolOptionId
        beolGroup {
          id
          groupName
        }
        workbookData
      }
    }
  }
`;

export const SEARCH_PHOTO_KEYS_BY_STREAM = gql`
  query SearchPhotoKeysByStream($query: String!) {
    searchPhotoKeysByStream(query: $query) {
      id
      tableName
      revNo
      rfgCategory
      photoCategory
      isReference
      filename
      updateDate
      productId
      product {
        id
        partId
        productName
      }
      processPlanId
      beolGroupId
      beolOptionId
      beolGroup {
        id
        groupName
      }
      workbookData
    }
  }
`;

export const GET_REQUEST_TABLES = gql`
  query GetRequestTables($requestId: Int!, $type: String!) {
    requestTables(requestId: $requestId, type: $type) {
      id
      photoKeyId
      type
      photoKey {
        id
        tableName
        revNo
        rfgCategory
        photoCategory
        isReference
        filename
        updateDate
        productId
        product {
          id
          partId
          productName
        }
        processPlanId
        beolGroupId
        beolOptionId
        beolGroup {
          id
          groupName
        }
        workbookData
      }
    }
  }
`;
