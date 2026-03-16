/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetProcessPlans {\n    processPlans {\n      id\n      designRule\n      beolOptions {\n        id\n        optionName\n        products {\n          id\n          partId\n          productName\n          metaInfo {\n            id\n            chip\n            shot\n            mto\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetProcessPlansDocument,
    "\n  mutation CreateProcessPlan($input: CreateProcessPlanInput!) {\n    createProcessPlan(input: $input) {\n      id\n      designRule\n    }\n  }\n": typeof types.CreateProcessPlanDocument,
    "\n  mutation CreateBeolOption($input: CreateBeolOptionInput!) {\n    createBeolOption(input: $input) {\n      id\n      optionName\n    }\n  }\n": typeof types.CreateBeolOptionDocument,
    "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      id\n      partId\n      productName\n    }\n  }\n": typeof types.CreateProductDocument,
    "\n  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {\n    updateProduct(id: $id, input: $input) {\n      id\n      productName\n      metaInfo {\n        id\n        chip\n        shot\n        mto\n      }\n    }\n  }\n": typeof types.UpdateProductDocument,
    "\n  mutation DeleteProduct($id: Int!) {\n    deleteProduct(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteProductDocument,
};
const documents: Documents = {
    "\n  query GetProcessPlans {\n    processPlans {\n      id\n      designRule\n      beolOptions {\n        id\n        optionName\n        products {\n          id\n          partId\n          productName\n          metaInfo {\n            id\n            chip\n            shot\n            mto\n          }\n        }\n      }\n    }\n  }\n": types.GetProcessPlansDocument,
    "\n  mutation CreateProcessPlan($input: CreateProcessPlanInput!) {\n    createProcessPlan(input: $input) {\n      id\n      designRule\n    }\n  }\n": types.CreateProcessPlanDocument,
    "\n  mutation CreateBeolOption($input: CreateBeolOptionInput!) {\n    createBeolOption(input: $input) {\n      id\n      optionName\n    }\n  }\n": types.CreateBeolOptionDocument,
    "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      id\n      partId\n      productName\n    }\n  }\n": types.CreateProductDocument,
    "\n  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {\n    updateProduct(id: $id, input: $input) {\n      id\n      productName\n      metaInfo {\n        id\n        chip\n        shot\n        mto\n      }\n    }\n  }\n": types.UpdateProductDocument,
    "\n  mutation DeleteProduct($id: Int!) {\n    deleteProduct(id: $id) {\n      id\n    }\n  }\n": types.DeleteProductDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetProcessPlans {\n    processPlans {\n      id\n      designRule\n      beolOptions {\n        id\n        optionName\n        products {\n          id\n          partId\n          productName\n          metaInfo {\n            id\n            chip\n            shot\n            mto\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProcessPlans {\n    processPlans {\n      id\n      designRule\n      beolOptions {\n        id\n        optionName\n        products {\n          id\n          partId\n          productName\n          metaInfo {\n            id\n            chip\n            shot\n            mto\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateProcessPlan($input: CreateProcessPlanInput!) {\n    createProcessPlan(input: $input) {\n      id\n      designRule\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProcessPlan($input: CreateProcessPlanInput!) {\n    createProcessPlan(input: $input) {\n      id\n      designRule\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateBeolOption($input: CreateBeolOptionInput!) {\n    createBeolOption(input: $input) {\n      id\n      optionName\n    }\n  }\n"): (typeof documents)["\n  mutation CreateBeolOption($input: CreateBeolOptionInput!) {\n    createBeolOption(input: $input) {\n      id\n      optionName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      id\n      partId\n      productName\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProduct($input: CreateProductInput!) {\n    createProduct(input: $input) {\n      id\n      partId\n      productName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {\n    updateProduct(id: $id, input: $input) {\n      id\n      productName\n      metaInfo {\n        id\n        chip\n        shot\n        mto\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {\n    updateProduct(id: $id, input: $input) {\n      id\n      productName\n      metaInfo {\n        id\n        chip\n        shot\n        mto\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteProduct($id: Int!) {\n    deleteProduct(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteProduct($id: Int!) {\n    deleteProduct(id: $id) {\n      id\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;