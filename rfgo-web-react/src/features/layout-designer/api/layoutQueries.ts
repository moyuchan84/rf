import { gql } from '@apollo/client';

export const GET_LAYOUTS = gql`
  query GetLayouts($productId: Int!) {
    layouts(productId: $productId) {
      id
      title
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
    }
  }
`;
