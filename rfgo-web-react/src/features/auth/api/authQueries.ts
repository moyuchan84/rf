import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      epId
      userId
      fullName
      deptName
      email
      role {
        id
        name
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($search: String, $skip: Int, $take: Int) {
    users(search: $search, skip: $skip, take: $take) {
      items {
        id
        epId
        userId
        fullName
        deptName
        email
        role {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      description
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: Int!, $roleId: Int!) {
    updateUserRole(userId: $userId, roleId: $roleId) {
      id
      role {
        id
        name
      }
    }
  }
`;
