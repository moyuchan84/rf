import { gql } from '@apollo/client';

export const GET_MY_MAIL_GROUPS = gql`
  query GetMyMailGroups($userId: String!) {
    myMailGroups(userId: $userId) {
      id
      userId
      groupName
      members {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
      createdAt
    }
  }
`;

export const CREATE_MAIL_GROUP = gql`
  mutation CreateMailGroup($userId: String!, $input: CreateUserMailGroupInput!) {
    createMailGroup(userId: $userId, input: $input) {
      id
      groupName
      members {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
    }
  }
`;

export const UPDATE_MAIL_GROUP = gql`
  mutation UpdateMailGroup($id: Int!, $userId: String!, $input: CreateUserMailGroupInput!) {
    updateMailGroup(id: $id, userId: $userId, input: $input) {
      id
      groupName
      members {
        epId
        fullName
        userId
        departmentName
        emailAddress
      }
    }
  }
`;

export const DELETE_MAIL_GROUP = gql`
  mutation DeleteMailGroup($id: Int!, $userId: String!) {
    deleteMailGroup(id: $id, userId: $userId)
  }
`;
