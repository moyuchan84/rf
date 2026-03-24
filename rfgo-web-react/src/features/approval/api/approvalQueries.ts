import { gql } from '@apollo/client';

export const GET_MY_APPROVAL_PATHS = gql`
  query GetMyApprovalPaths($userId: String!) {
    getMyApprovalPaths(userId: $userId) {
      id
      pathName
      pathItems {
        epId
        userId
        fullName
        email
        role
        aplnStatsCode
      }
    }
  }
`;

export const SAVE_APPROVAL_PATH = gql`
  mutation SaveApprovalPath($userId: String!, $input: SaveApprovalPathInput!) {
    saveApprovalPath(userId: $userId, input: $input) {
      id
      pathName
      pathItems {
        epId
        userId
        fullName
        email
        role
        aplnStatsCode
      }
    }
  }
`;

export const UPDATE_APPROVAL_PATH = gql`
  mutation UpdateApprovalPath($id: Int!, $input: SaveApprovalPathInput!) {
    updateApprovalPath(id: $id, input: $input) {
      id
      pathName
      pathItems {
        epId
        userId
        fullName
        email
        role
        aplnStatsCode
      }
    }
  }
`;

export const DELETE_APPROVAL_PATH = gql`
  mutation DeleteApprovalPath($id: Int!) {
    deleteApprovalPath(id: $id)
  }
`;
