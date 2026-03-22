import { gql } from '@apollo/client';

/**
 * User Management Queries
 */
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

/**
 * System Mailing Queries
 */
export const GET_ALL_SYSTEM_DEFAULT_MAILERS = gql`
  query GetAllSystemDefaultMailers {
    allSystemDefaultMailers {
      id
      category
      recipients {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
    }
  }
`;

export const UPDATE_SYSTEM_DEFAULT_MAILER = gql`
  mutation UpdateSystemDefaultMailer($category: String!, $recipients: [EmployeeInput!]!) {
    updateSystemDefaultMailer(category: $category, recipients: $recipients) {
      id
      category
      recipients {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
    }
  }
`;
