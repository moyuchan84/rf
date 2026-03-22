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
