import { gql } from '../../../shared/api/generated';

export const GET_PROCESS_PLANS = gql`
  query GetProcessPlans {
    processPlans {
      id
      designRule
      beolOptions {
        id
        optionName
        products {
          id
          partId
          productName
          metaInfo {
            id
            chip
            shot
            mto
          }
        }
      }
    }
  }
`;

export const CREATE_PROCESS_PLAN = gql`
  mutation CreateProcessPlan($input: CreateProcessPlanInput!) {
    createProcessPlan(input: $input) {
      id
      designRule
    }
  }
`;

export const CREATE_BEOL_OPTION = gql`
  mutation CreateBeolOption($input: CreateBeolOptionInput!) {
    createBeolOption(input: $input) {
      id
      optionName
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      partId
      productName
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      productName
      metaInfo {
        id
        chip
        shot
        mto
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;
