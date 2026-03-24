import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    requestItems(take: 50, skip: 0) {
      items {
        id
        title
        requestType
        createdAt
        requesterId
        product {
          productName
        }
      }
      totalCount
    }
    keyDesigns {
      id
      createdAt
    }
    photoKeys {
      id
      updateDate
      processPlanId
    }
    processPlans {
      id
      designRule
    }
    # ReticleLayout count is tricky as the query needs productId.
    # We might need a generic count query or fetch products first.
    # For now, we'll try to fetch all layouts if the backend allows (might need specific query).
    # Since layouts(productId: Int!) requires productId, we'll focus on the others first or
    # assume we fetch them separately if needed.
  }
`;

export const GET_RECENT_REQUESTS = gql`
  query GetRecentRequests($take: Int!) {
    requestItems(take: $take, skip: 0) {
      items {
        id
        title
        requestType
        createdAt
        requesterId
        product {
          productName
        }
        steps {
          status
        }
      }
    }
  }
`;
