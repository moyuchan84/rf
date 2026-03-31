import { gql } from '@apollo/client';

export const GET_LAYOUTS = gql`
  query GetLayouts($productId: Int!) {
    layouts(productId: $productId) {
      id
      title
      productId
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

export const GET_LAYOUT = gql`
  query GetLayout($id: Int!) {
    layout(id: $id) {
      id
      title
      productId
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

export const UPDATE_LAYOUT = gql`
  mutation UpdateLayout($id: Int!, $input: UpdateLayoutInput!) {
    updateLayout(id: $id, input: $input) {
      id
      title
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
