import { gql } from '@apollo/client';

export const GET_KEY_DESIGNS = gql`
  query GetKeyDesigns {
    keyDesigns {
      id
      name
      keyType
      sizeX
      sizeY
      isVertical
      isHorizontal
      rotation
      description
      gdsPath
      edmList
      xAxis
      yAxis
      images
      processPlans {
        id
        designRule
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_KEY_DESIGN = gql`
  mutation CreateKeyDesign($input: CreateKeyDesignInput!) {
    createKeyDesign(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_KEY_DESIGN = gql`
  mutation UpdateKeyDesign($id: Int!, $input: UpdateKeyDesignInput!) {
    updateKeyDesign(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_KEY_DESIGN = gql`
  mutation RemoveKeyDesign($id: Int!) {
    removeKeyDesign(id: $id) {
      id
    }
  }
`;
