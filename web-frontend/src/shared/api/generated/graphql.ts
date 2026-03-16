/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type BeolOption = {
  __typename?: 'BeolOption';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  optionName: Scalars['String']['output'];
  processPlanId: Scalars['Int']['output'];
  products: Array<Product>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateBeolOptionInput = {
  optionName: Scalars['String']['input'];
  processPlanId: Scalars['Int']['input'];
};

export type CreateProcessPlanInput = {
  designRule: Scalars['String']['input'];
};

export type CreateProductInput = {
  beolOptionId: Scalars['Int']['input'];
  metaInfo?: InputMaybe<ProductMetaInput>;
  partId: Scalars['String']['input'];
  productName: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createBeolOption: BeolOption;
  createProcessPlan: ProcessPlan;
  createProduct: Product;
  deleteBeolOption: BeolOption;
  deleteProcessPlan: ProcessPlan;
  deleteProduct: Product;
  updateProduct: Product;
};


export type MutationCreateBeolOptionArgs = {
  input: CreateBeolOptionInput;
};


export type MutationCreateProcessPlanArgs = {
  input: CreateProcessPlanInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationDeleteBeolOptionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProcessPlanArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUpdateProductArgs = {
  id: Scalars['Int']['input'];
  input: UpdateProductInput;
};

export type ProcessPlan = {
  __typename?: 'ProcessPlan';
  beolOptions: Array<BeolOption>;
  createdAt: Scalars['DateTime']['output'];
  designRule: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Product = {
  __typename?: 'Product';
  beolOptionId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  metaInfo?: Maybe<ProductMeta>;
  partId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductMeta = {
  __typename?: 'ProductMeta';
  chip?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  mto?: Maybe<Scalars['String']['output']>;
  productId: Scalars['Int']['output'];
  shot?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductMetaInput = {
  chip?: InputMaybe<Scalars['String']['input']>;
  mto?: InputMaybe<Scalars['String']['input']>;
  shot?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  processPlans: Array<ProcessPlan>;
};

export type UpdateProductInput = {
  metaInfo?: InputMaybe<ProductMetaInput>;
  productName?: InputMaybe<Scalars['String']['input']>;
};

export type GetProcessPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProcessPlansQuery = { __typename?: 'Query', processPlans: Array<{ __typename?: 'ProcessPlan', id: string, designRule: string, beolOptions: Array<{ __typename?: 'BeolOption', id: string, optionName: string, products: Array<{ __typename?: 'Product', id: string, partId: string, productName: string, metaInfo?: { __typename?: 'ProductMeta', id: string, chip?: string | null, shot?: string | null, mto?: string | null } | null }> }> }> };

export type CreateProcessPlanMutationVariables = Exact<{
  input: CreateProcessPlanInput;
}>;


export type CreateProcessPlanMutation = { __typename?: 'Mutation', createProcessPlan: { __typename?: 'ProcessPlan', id: string, designRule: string } };

export type CreateBeolOptionMutationVariables = Exact<{
  input: CreateBeolOptionInput;
}>;


export type CreateBeolOptionMutation = { __typename?: 'Mutation', createBeolOption: { __typename?: 'BeolOption', id: string, optionName: string } };

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct: { __typename?: 'Product', id: string, partId: string, productName: string } };

export type UpdateProductMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateProductInput;
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'Product', id: string, productName: string, metaInfo?: { __typename?: 'ProductMeta', id: string, chip?: string | null, shot?: string | null, mto?: string | null } | null } };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: { __typename?: 'Product', id: string } };


export const GetProcessPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProcessPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"processPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designRule"}},{"kind":"Field","name":{"kind":"Name","value":"beolOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"metaInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chip"}},{"kind":"Field","name":{"kind":"Name","value":"shot"}},{"kind":"Field","name":{"kind":"Name","value":"mto"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetProcessPlansQuery, GetProcessPlansQueryVariables>;
export const CreateProcessPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProcessPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProcessPlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProcessPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designRule"}}]}}]}}]} as unknown as DocumentNode<CreateProcessPlanMutation, CreateProcessPlanMutationVariables>;
export const CreateBeolOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBeolOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBeolOptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBeolOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}}]}}]}}]} as unknown as DocumentNode<CreateBeolOptionMutation, CreateBeolOptionMutationVariables>;
export const CreateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}}]}}]}}]} as unknown as DocumentNode<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"metaInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chip"}},{"kind":"Field","name":{"kind":"Name","value":"shot"}},{"kind":"Field","name":{"kind":"Name","value":"mto"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteProductMutation, DeleteProductMutationVariables>;