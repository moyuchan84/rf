import { gql } from '@apollo/client';

export const GET_PROCESS_PLANS = gql`
  query GetProcessPlans {
    processPlans {
      id
      designRule
      beolOptions {
        id
        optionName
        beolGroup {
          id
          groupName
        }
        processPlan {
          id
          designRule
        }
        products {
          id
          partId
          productName
          metaInfo {
            id
            processId
            customer
            application
            chipSizeX
            chipSizeY
            slSizeX
            slSizeY
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

export const CREATE_BEOL_GROUP = gql`
  mutation CreateBeolGroup($input: CreateBeolGroupInput!) {
    createBeolGroup(input: $input) {
      id
      groupName
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
        processId
        customer
        application
        chipSizeX
        chipSizeY
        slSizeX
        slSizeY
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

export const DELETE_PROCESS_PLAN = gql`
  mutation DeleteProcessPlan($id: Int!) {
    deleteProcessPlan(id: $id) {
      id
    }
  }
`;

export const DELETE_BEOL_GROUP = gql`
  mutation DeleteBeolGroup($id: Int!) {
    deleteBeolGroup(id: $id) {
      id
    }
  }
`;

export const DELETE_BEOL_OPTION = gql`
  mutation DeleteBeolOption($id: Int!) {
    deleteBeolOption(id: $id) {
      id
    }
  }
`;

export const GET_UNIQUE_PROCESS_GROUPS = gql`
  query GetUniqueProcessGroups {
    uniqueProcessGroups
  }
`;

export const GET_UNIQUE_BEOLS = gql`
  query GetUniqueBeols($processGrp: String!) {
    uniqueBeols(processGrp: $processGrp)
  }
`;
