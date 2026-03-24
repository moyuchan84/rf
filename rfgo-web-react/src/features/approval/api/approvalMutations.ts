import { gql } from '@apollo/client';

export const SUBMIT_APPROVAL = gql`
  mutation SubmitApproval(
    $requestId: Int!, 
    $requesterId: String!, 
    $title: String!, 
    $path: [ApprovalPathItemInput!]!, 
    $content: String!
  ) {
    submitApproval(
      requestId: $requestId, 
      requesterId: $requesterId, 
      title: $title, 
      path: $path, 
      content: $content
    ) {
      result
      apInfId
      message
    }
  }
`;
