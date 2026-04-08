import { gql } from '@apollo/client';

export const PAGINATED_LAYOUTS = gql`
  query PaginatedLayouts($skip: Int, $take: Int, $search: String, $productId: Int) {
    paginatedLayouts(skip: $skip, take: $take, search: $search, productId: $productId) {
      items {
        id
        title
        productId
        beolOptionId
        processPlanId
        boundary
        chips
        scribelanes
        placements
        shotInfo
        config
        imageUrl
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_LAYOUT = gql`
  query GetLayout($id: Int!) {
    layout(id: $id) {
      id
      title
      productId
      beolOptionId
      processPlanId
      boundary
      chips
      scribelanes
      placements
      shotInfo
      config
      imageUrl
    }
  }
`;

export const SAVE_LAYOUT = gql`
  mutation SaveLayout($input: CreateLayoutInput!) {
    saveLayout(input: $input) {
      id
      title
      productId
      beolOptionId
      processPlanId
      boundary
      chips
      scribelanes
      placements
      shotInfo
      config
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LAYOUT = gql`
  mutation UpdateLayout($id: Int!, $input: UpdateLayoutInput!) {
    updateLayout(id: $id, input: $input) {
      id
      title
      productId
      beolOptionId
      processPlanId
      boundary
      chips
      scribelanes
      placements
      shotInfo
      config
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_LAYOUT = gql`
  mutation DeleteLayout($id: Int!) {
    deleteLayout(id: $id) {
      id
    }
  }
`;
