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
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AssignUserInput = {
  category: Scalars['String']['input'];
  requestId: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};

export type BeolOption = {
  __typename?: 'BeolOption';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  optionName: Scalars['String']['output'];
  processPlanId: Scalars['Int']['output'];
  products: Array<Product>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateBeolOptionInput = {
  optionName: Scalars['String']['input'];
  processPlanId: Scalars['Int']['input'];
};

export type CreateKeyDesignInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  edmList?: Array<Scalars['String']['input']>;
  gdsPath?: InputMaybe<Scalars['String']['input']>;
  images?: Array<Scalars['String']['input']>;
  isHorizontal?: Scalars['Boolean']['input'];
  isVertical?: Scalars['Boolean']['input'];
  keyType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  processPlanIds?: Array<Scalars['Int']['input']>;
  rotation?: Scalars['Float']['input'];
  sizeX: Scalars['Float']['input'];
  sizeY: Scalars['Float']['input'];
  xAxis: Scalars['JSON']['input'];
  yAxis: Scalars['JSON']['input'];
};

export type CreateLayoutInput = {
  beolOptionId?: InputMaybe<Scalars['Int']['input']>;
  boundary?: InputMaybe<Scalars['JSON']['input']>;
  chips?: InputMaybe<Scalars['JSON']['input']>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  placements?: InputMaybe<Scalars['JSON']['input']>;
  processPlanId?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  scribelanes?: InputMaybe<Scalars['JSON']['input']>;
  shotInfo?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
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

export type CreateRequestItemInput = {
  description: Scalars['String']['input'];
  edmList: Array<Scalars['String']['input']>;
  pkdVersions: Array<Scalars['String']['input']>;
  productId: Scalars['Int']['input'];
  requestType: Scalars['String']['input'];
  requesterId: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateStreamInfoInput = {
  beolOptionId: Scalars['Int']['input'];
  processPlanId: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
  requestId: Scalars['Int']['input'];
  streamInputOutputFile?: InputMaybe<Scalars['String']['input']>;
  streamPath: Scalars['String']['input'];
};

export type KeyDesign = {
  __typename?: 'KeyDesign';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  edmList: Array<Scalars['String']['output']>;
  gdsPath?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images: Array<Scalars['String']['output']>;
  isHorizontal: Scalars['Boolean']['output'];
  isVertical: Scalars['Boolean']['output'];
  keyType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  processPlans?: Maybe<Array<ProcessPlan>>;
  rotation: Scalars['Float']['output'];
  sizeX: Scalars['Float']['output'];
  sizeY: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  xAxis: Scalars['JSON']['output'];
  yAxis: Scalars['JSON']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignUser: RequestAssignee;
  createBeolOption: BeolOption;
  createKeyDesign: KeyDesign;
  createProcessPlan: ProcessPlan;
  createProduct: Product;
  createRequestItem: RequestItem;
  createStreamInfo: StreamInfo;
  deleteBeolOption: BeolOption;
  deleteLayout: ReticleLayout;
  deleteProcessPlan: ProcessPlan;
  deleteProduct: Product;
  deleteRequestItem: RequestItem;
  removeAssignee: RequestAssignee;
  removeKeyDesign: KeyDesign;
  saveLayout: ReticleLayout;
  saveRequestTables: Array<RequestTableMap>;
  updateKeyDesign: KeyDesign;
  updateLayout: ReticleLayout;
  updateProduct: Product;
  updateRequestItem: RequestItem;
  updateRequestStep: RequestStep;
  updateUserRole: UserType;
};


export type MutationAssignUserArgs = {
  input: AssignUserInput;
};


export type MutationCreateBeolOptionArgs = {
  input: CreateBeolOptionInput;
};


export type MutationCreateKeyDesignArgs = {
  input: CreateKeyDesignInput;
};


export type MutationCreateProcessPlanArgs = {
  input: CreateProcessPlanInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateRequestItemArgs = {
  input: CreateRequestItemInput;
};


export type MutationCreateStreamInfoArgs = {
  input: CreateStreamInfoInput;
};


export type MutationDeleteBeolOptionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteLayoutArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProcessPlanArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteRequestItemArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveAssigneeArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveKeyDesignArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSaveLayoutArgs = {
  input: CreateLayoutInput;
};


export type MutationSaveRequestTablesArgs = {
  input: SaveRequestTablesInput;
};


export type MutationUpdateKeyDesignArgs = {
  id: Scalars['Int']['input'];
  input: UpdateKeyDesignInput;
};


export type MutationUpdateLayoutArgs = {
  id: Scalars['Int']['input'];
  input: UpdateLayoutInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['Int']['input'];
  input: UpdateProductInput;
};


export type MutationUpdateRequestItemArgs = {
  id: Scalars['Int']['input'];
  input: UpdateRequestItemInput;
};


export type MutationUpdateRequestStepArgs = {
  input: UpdateStepInput;
};


export type MutationUpdateUserRoleArgs = {
  roleId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  items: Array<UserType>;
  totalCount: Scalars['Int']['output'];
};

export type PhotoKey = {
  __typename?: 'PhotoKey';
  beolOptionId?: Maybe<Scalars['Int']['output']>;
  filename: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isReference: Scalars['Boolean']['output'];
  log?: Maybe<Scalars['String']['output']>;
  photoCategory?: Maybe<Scalars['String']['output']>;
  processPlanId?: Maybe<Scalars['Int']['output']>;
  productId: Scalars['Int']['output'];
  rawBinary?: Maybe<Scalars['String']['output']>;
  revNo: Scalars['Int']['output'];
  rfgCategory?: Maybe<Scalars['String']['output']>;
  tableName: Scalars['String']['output'];
  updateDate: Scalars['DateTime']['output'];
  updater?: Maybe<Scalars['String']['output']>;
  workbookData?: Maybe<Scalars['JSON']['output']>;
};

export type ProcessPlan = {
  __typename?: 'ProcessPlan';
  beolOptions: Array<BeolOption>;
  createdAt: Scalars['DateTime']['output'];
  designRule: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  keyDesigns?: Maybe<Array<KeyDesign>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Product = {
  __typename?: 'Product';
  beolOptionId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  metaInfo?: Maybe<ProductMeta>;
  partId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  requests?: Maybe<Array<RequestItem>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductMeta = {
  __typename?: 'ProductMeta';
  application?: Maybe<Scalars['String']['output']>;
  chipSizeX?: Maybe<Scalars['Float']['output']>;
  chipSizeY?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customer?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  mtoDate?: Maybe<Scalars['DateTime']['output']>;
  processId?: Maybe<Scalars['String']['output']>;
  productId: Scalars['Int']['output'];
  slSizeX?: Maybe<Scalars['Float']['output']>;
  slSizeY?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductMetaInput = {
  application?: InputMaybe<Scalars['String']['input']>;
  chipSizeX?: InputMaybe<Scalars['Float']['input']>;
  chipSizeY?: InputMaybe<Scalars['Float']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  mtoDate?: InputMaybe<Scalars['DateTime']['input']>;
  processId?: InputMaybe<Scalars['String']['input']>;
  slSizeX?: InputMaybe<Scalars['Float']['input']>;
  slSizeY?: InputMaybe<Scalars['Float']['input']>;
};

export type Query = {
  __typename?: 'Query';
  keyDesign: KeyDesign;
  keyDesigns: Array<KeyDesign>;
  layout?: Maybe<ReticleLayout>;
  layouts: Array<ReticleLayout>;
  me?: Maybe<UserType>;
  photoKeys: Array<PhotoKey>;
  processPlans: Array<ProcessPlan>;
  requestItem?: Maybe<RequestItem>;
  requestItems: Array<RequestItem>;
  requestItemsByProduct: Array<RequestItem>;
  requestTables: Array<RequestTableMap>;
  roles: Array<RoleType>;
  streamInfoByRequest: Array<StreamInfo>;
  streamInfosByProduct: Array<StreamInfo>;
  users: PaginatedUsers;
};


export type QueryKeyDesignArgs = {
  id: Scalars['Int']['input'];
};


export type QueryLayoutArgs = {
  id: Scalars['Int']['input'];
};


export type QueryLayoutsArgs = {
  productId: Scalars['Int']['input'];
};


export type QueryPhotoKeysArgs = {
  beolOptionId?: InputMaybe<Scalars['Int']['input']>;
  processPlanId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRequestItemArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRequestItemsByProductArgs = {
  productId: Scalars['Int']['input'];
};


export type QueryRequestTablesArgs = {
  requestId: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};


export type QueryStreamInfoByRequestArgs = {
  requestId: Scalars['Int']['input'];
};


export type QueryStreamInfosByProductArgs = {
  productId: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};

export type RequestAssignee = {
  __typename?: 'RequestAssignee';
  category: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  requestId: Scalars['Int']['output'];
  userId: Scalars['String']['output'];
  userName: Scalars['String']['output'];
};

export type RequestItem = {
  __typename?: 'RequestItem';
  assignees?: Maybe<Array<RequestAssignee>>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  edmList: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  pkdVersions: Array<Scalars['String']['output']>;
  productId: Scalars['Int']['output'];
  requestType: Scalars['String']['output'];
  requesterId: Scalars['String']['output'];
  steps?: Maybe<Array<RequestStep>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RequestStep = {
  __typename?: 'RequestStep';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  requestId: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  stepName: Scalars['String']['output'];
  stepOrder: Scalars['Int']['output'];
  workContent?: Maybe<Scalars['String']['output']>;
  workerId?: Maybe<Scalars['String']['output']>;
};

export type RequestTableMap = {
  __typename?: 'RequestTableMap';
  beolOptionId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  photoKey?: Maybe<PhotoKey>;
  photoKeyId: Scalars['Int']['output'];
  processPlanId?: Maybe<Scalars['Int']['output']>;
  productId?: Maybe<Scalars['Int']['output']>;
  requestId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type ReticleLayout = {
  __typename?: 'ReticleLayout';
  beolOptionId?: Maybe<Scalars['Int']['output']>;
  boundary?: Maybe<Scalars['JSON']['output']>;
  chips?: Maybe<Scalars['JSON']['output']>;
  config?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  placements?: Maybe<Scalars['JSON']['output']>;
  processPlanId?: Maybe<Scalars['Int']['output']>;
  productId: Scalars['Int']['output'];
  scribelanes?: Maybe<Scalars['JSON']['output']>;
  shotInfo?: Maybe<Scalars['JSON']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RoleType = {
  __typename?: 'RoleType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type SaveRequestTablesInput = {
  beolOptionId: Scalars['Int']['input'];
  photoKeyIds: Array<Scalars['Int']['input']>;
  processPlanId: Scalars['Int']['input'];
  productId: Scalars['Int']['input'];
  requestId: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};

export type StreamInfo = {
  __typename?: 'StreamInfo';
  beolOptionId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  processPlanId: Scalars['Int']['output'];
  productId: Scalars['Int']['output'];
  request?: Maybe<RequestItem>;
  requestId: Scalars['Int']['output'];
  streamInputOutputFile?: Maybe<Scalars['String']['output']>;
  streamPath: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateKeyDesignInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  edmList?: InputMaybe<Array<Scalars['String']['input']>>;
  gdsPath?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isHorizontal?: InputMaybe<Scalars['Boolean']['input']>;
  isVertical?: InputMaybe<Scalars['Boolean']['input']>;
  keyType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  processPlanIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  rotation?: InputMaybe<Scalars['Float']['input']>;
  sizeX?: InputMaybe<Scalars['Float']['input']>;
  sizeY?: InputMaybe<Scalars['Float']['input']>;
  xAxis?: InputMaybe<Scalars['JSON']['input']>;
  yAxis?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateLayoutInput = {
  boundary?: InputMaybe<Scalars['JSON']['input']>;
  chips?: InputMaybe<Scalars['JSON']['input']>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['Int']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  placements?: InputMaybe<Scalars['JSON']['input']>;
  scribelanes?: InputMaybe<Scalars['JSON']['input']>;
  shotInfo?: InputMaybe<Scalars['JSON']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  metaInfo?: InputMaybe<ProductMetaInput>;
  productName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRequestItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  edmList?: InputMaybe<Array<Scalars['String']['input']>>;
  pkdVersions?: InputMaybe<Array<Scalars['String']['input']>>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  requestType?: InputMaybe<Scalars['String']['input']>;
  requesterId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStepInput = {
  status: Scalars['String']['input'];
  stepId: Scalars['Int']['input'];
  workContent?: InputMaybe<Scalars['String']['input']>;
  workerId?: InputMaybe<Scalars['String']['input']>;
};

export type UserType = {
  __typename?: 'UserType';
  deptName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  epId: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  role: RoleType;
  userId: Scalars['String']['output'];
};

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'UserType', id: number, epId: string, userId: string, fullName: string, deptName: string, email: string, role: { __typename?: 'RoleType', id: number, name: string } } | null };

export type GetUsersQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: { __typename?: 'PaginatedUsers', totalCount: number, items: Array<{ __typename?: 'UserType', id: number, epId: string, userId: string, fullName: string, deptName: string, email: string, role: { __typename?: 'RoleType', id: number, name: string } }> } };

export type GetRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRolesQuery = { __typename?: 'Query', roles: Array<{ __typename?: 'RoleType', id: number, name: string, description?: string | null }> };

export type UpdateUserRoleMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  roleId: Scalars['Int']['input'];
}>;


export type UpdateUserRoleMutation = { __typename?: 'Mutation', updateUserRole: { __typename?: 'UserType', id: number, role: { __typename?: 'RoleType', id: number, name: string } } };

export type GetKeyDesignsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetKeyDesignsQuery = { __typename?: 'Query', keyDesigns: Array<{ __typename?: 'KeyDesign', id: string, name: string, keyType: string, sizeX: number, sizeY: number, isVertical: boolean, isHorizontal: boolean, rotation: number, description?: string | null, gdsPath?: string | null, edmList: Array<string>, xAxis: any, yAxis: any, images: Array<string>, createdAt: any, updatedAt: any, processPlans?: Array<{ __typename?: 'ProcessPlan', id: number, designRule: string }> | null }> };

export type CreateKeyDesignMutationVariables = Exact<{
  input: CreateKeyDesignInput;
}>;


export type CreateKeyDesignMutation = { __typename?: 'Mutation', createKeyDesign: { __typename?: 'KeyDesign', id: string, name: string } };

export type UpdateKeyDesignMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateKeyDesignInput;
}>;


export type UpdateKeyDesignMutation = { __typename?: 'Mutation', updateKeyDesign: { __typename?: 'KeyDesign', id: string, name: string } };

export type RemoveKeyDesignMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type RemoveKeyDesignMutation = { __typename?: 'Mutation', removeKeyDesign: { __typename?: 'KeyDesign', id: string } };

export type GetPhotoKeysQueryVariables = Exact<{
  productId?: InputMaybe<Scalars['Int']['input']>;
  beolOptionId?: InputMaybe<Scalars['Int']['input']>;
  processPlanId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPhotoKeysQuery = { __typename?: 'Query', photoKeys: Array<{ __typename?: 'PhotoKey', id: number, tableName: string, revNo: number, rfgCategory?: string | null, photoCategory?: string | null, isReference: boolean, filename: string, log?: string | null, updateDate: any, productId: number, processPlanId?: number | null, beolOptionId?: number | null, workbookData?: any | null }> };

export type GetLayoutsQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;


export type GetLayoutsQuery = { __typename?: 'Query', layouts: Array<{ __typename?: 'ReticleLayout', id: number, title: string, boundary?: any | null, chips?: any | null, scribelanes?: any | null, placements?: any | null, shotInfo?: any | null, config?: any | null, imageUrl?: string | null }> };

export type SaveLayoutMutationVariables = Exact<{
  input: CreateLayoutInput;
}>;


export type SaveLayoutMutation = { __typename?: 'Mutation', saveLayout: { __typename?: 'ReticleLayout', id: number, title: string } };

export type GetProcessPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProcessPlansQuery = { __typename?: 'Query', processPlans: Array<{ __typename?: 'ProcessPlan', id: number, designRule: string, beolOptions: Array<{ __typename?: 'BeolOption', id: number, optionName: string, products: Array<{ __typename?: 'Product', id: number, partId: string, productName: string, metaInfo?: { __typename?: 'ProductMeta', id: number, processId?: string | null, mtoDate?: any | null, customer?: string | null, application?: string | null, chipSizeX?: number | null, chipSizeY?: number | null, slSizeX?: number | null, slSizeY?: number | null } | null }> }> }> };

export type CreateProcessPlanMutationVariables = Exact<{
  input: CreateProcessPlanInput;
}>;


export type CreateProcessPlanMutation = { __typename?: 'Mutation', createProcessPlan: { __typename?: 'ProcessPlan', id: number, designRule: string } };

export type CreateBeolOptionMutationVariables = Exact<{
  input: CreateBeolOptionInput;
}>;


export type CreateBeolOptionMutation = { __typename?: 'Mutation', createBeolOption: { __typename?: 'BeolOption', id: number, optionName: string } };

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct: { __typename?: 'Product', id: number, partId: string, productName: string } };

export type UpdateProductMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateProductInput;
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct: { __typename?: 'Product', id: number, productName: string, metaInfo?: { __typename?: 'ProductMeta', id: number, processId?: string | null, mtoDate?: any | null, customer?: string | null, application?: string | null, chipSizeX?: number | null, chipSizeY?: number | null, slSizeX?: number | null, slSizeY?: number | null } | null } };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: { __typename?: 'Product', id: number } };

export type CreateRequestItemMutationVariables = Exact<{
  input: CreateRequestItemInput;
}>;


export type CreateRequestItemMutation = { __typename?: 'Mutation', createRequestItem: { __typename?: 'RequestItem', id: number, requestType: string, title: string, description: string, edmList: Array<string>, pkdVersions: Array<string>, requesterId: string, createdAt: any } };

export type UpdateRequestItemMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateRequestItemInput;
}>;


export type UpdateRequestItemMutation = { __typename?: 'Mutation', updateRequestItem: { __typename?: 'RequestItem', id: number, requestType: string, title: string, description: string, edmList: Array<string>, pkdVersions: Array<string>, requesterId: string, updatedAt: any } };

export type DeleteRequestItemMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteRequestItemMutation = { __typename?: 'Mutation', deleteRequestItem: { __typename?: 'RequestItem', id: number } };

export type GetRequestsByProductQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;


export type GetRequestsByProductQuery = { __typename?: 'Query', requestItemsByProduct: Array<{ __typename?: 'RequestItem', id: number, requestType: string, title: string, description: string, edmList: Array<string>, pkdVersions: Array<string>, requesterId: string, createdAt: any, updatedAt: any, assignees?: Array<{ __typename?: 'RequestAssignee', id: number, category: string, userId: string, userName: string }> | null, steps?: Array<{ __typename?: 'RequestStep', id: number, requestId: number, stepOrder: number, stepName: string, status: string, workContent?: string | null, workerId?: string | null, completedAt?: any | null }> | null }> };

export type GetAllRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllRequestsQuery = { __typename?: 'Query', requestItems: Array<{ __typename?: 'RequestItem', id: number, requestType: string, title: string, description: string, edmList: Array<string>, pkdVersions: Array<string>, requesterId: string, createdAt: any, updatedAt: any, productId: number, assignees?: Array<{ __typename?: 'RequestAssignee', id: number, category: string, userId: string, userName: string }> | null, steps?: Array<{ __typename?: 'RequestStep', id: number, requestId: number, stepOrder: number, stepName: string, status: string, workContent?: string | null, workerId?: string | null, completedAt?: any | null }> | null }> };

export type GetRequestItemQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetRequestItemQuery = { __typename?: 'Query', requestItem?: { __typename?: 'RequestItem', id: number, requestType: string, title: string, description: string, edmList: Array<string>, pkdVersions: Array<string>, requesterId: string, productId: number, createdAt: any, updatedAt: any, assignees?: Array<{ __typename?: 'RequestAssignee', id: number, category: string, userId: string, userName: string }> | null, steps?: Array<{ __typename?: 'RequestStep', id: number, requestId: number, stepOrder: number, stepName: string, status: string, workContent?: string | null, workerId?: string | null, completedAt?: any | null }> | null } | null };

export type AssignUserMutationVariables = Exact<{
  input: AssignUserInput;
}>;


export type AssignUserMutation = { __typename?: 'Mutation', assignUser: { __typename?: 'RequestAssignee', id: number, category: string, userId: string, userName: string } };

export type RemoveAssigneeMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type RemoveAssigneeMutation = { __typename?: 'Mutation', removeAssignee: { __typename?: 'RequestAssignee', id: number } };

export type UpdateRequestStepMutationVariables = Exact<{
  input: UpdateStepInput;
}>;


export type UpdateRequestStepMutation = { __typename?: 'Mutation', updateRequestStep: { __typename?: 'RequestStep', id: number, status: string, workContent?: string | null, workerId?: string | null, completedAt?: any | null } };

export type GetPhotoKeysForRequestQueryVariables = Exact<{
  productId?: InputMaybe<Scalars['Int']['input']>;
  beolOptionId?: InputMaybe<Scalars['Int']['input']>;
  processPlanId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPhotoKeysForRequestQuery = { __typename?: 'Query', photoKeys: Array<{ __typename?: 'PhotoKey', id: number, tableName: string, revNo: number, rfgCategory?: string | null, photoCategory?: string | null, isReference: boolean, filename: string, updateDate: any, productId: number, processPlanId?: number | null, beolOptionId?: number | null, workbookData?: any | null }> };

export type CreateStreamInfoMutationVariables = Exact<{
  input: CreateStreamInfoInput;
}>;


export type CreateStreamInfoMutation = { __typename?: 'Mutation', createStreamInfo: { __typename?: 'StreamInfo', id: number, streamPath: string, streamInputOutputFile?: string | null } };

export type GetStreamInfosByProductQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;


export type GetStreamInfosByProductQuery = { __typename?: 'Query', streamInfosByProduct: Array<{ __typename?: 'StreamInfo', id: number, requestId: number, streamPath: string, streamInputOutputFile?: string | null }> };

export type GetStreamInfoByRequestQueryVariables = Exact<{
  requestId: Scalars['Int']['input'];
}>;


export type GetStreamInfoByRequestQuery = { __typename?: 'Query', streamInfoByRequest: Array<{ __typename?: 'StreamInfo', id: number, streamPath: string, streamInputOutputFile?: string | null }> };

export type SaveRequestTablesMutationVariables = Exact<{
  input: SaveRequestTablesInput;
}>;


export type SaveRequestTablesMutation = { __typename?: 'Mutation', saveRequestTables: Array<{ __typename?: 'RequestTableMap', id: number, photoKeyId: number, type: string }> };

export type GetRequestTablesQueryVariables = Exact<{
  requestId: Scalars['Int']['input'];
  type: Scalars['String']['input'];
}>;


export type GetRequestTablesQuery = { __typename?: 'Query', requestTables: Array<{ __typename?: 'RequestTableMap', id: number, photoKeyId: number, type: string }> };


export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"epId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"deptName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"epId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"deptName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const GetRolesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetRolesQuery, GetRolesQueryVariables>;
export const UpdateUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"roleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const GetKeyDesignsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetKeyDesigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"keyDesigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"keyType"}},{"kind":"Field","name":{"kind":"Name","value":"sizeX"}},{"kind":"Field","name":{"kind":"Name","value":"sizeY"}},{"kind":"Field","name":{"kind":"Name","value":"isVertical"}},{"kind":"Field","name":{"kind":"Name","value":"isHorizontal"}},{"kind":"Field","name":{"kind":"Name","value":"rotation"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"gdsPath"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"xAxis"}},{"kind":"Field","name":{"kind":"Name","value":"yAxis"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"processPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designRule"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetKeyDesignsQuery, GetKeyDesignsQueryVariables>;
export const CreateKeyDesignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateKeyDesign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateKeyDesignInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createKeyDesign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateKeyDesignMutation, CreateKeyDesignMutationVariables>;
export const UpdateKeyDesignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateKeyDesign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateKeyDesignInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateKeyDesign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateKeyDesignMutation, UpdateKeyDesignMutationVariables>;
export const RemoveKeyDesignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveKeyDesign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeKeyDesign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveKeyDesignMutation, RemoveKeyDesignMutationVariables>;
export const GetPhotoKeysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPhotoKeys"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beolOptionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"processPlanId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photoKeys"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"beolOptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beolOptionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"processPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"processPlanId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tableName"}},{"kind":"Field","name":{"kind":"Name","value":"revNo"}},{"kind":"Field","name":{"kind":"Name","value":"rfgCategory"}},{"kind":"Field","name":{"kind":"Name","value":"photoCategory"}},{"kind":"Field","name":{"kind":"Name","value":"isReference"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"log"}},{"kind":"Field","name":{"kind":"Name","value":"updateDate"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"processPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"beolOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"workbookData"}}]}}]}}]} as unknown as DocumentNode<GetPhotoKeysQuery, GetPhotoKeysQueryVariables>;
export const GetLayoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLayouts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"layouts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"boundary"}},{"kind":"Field","name":{"kind":"Name","value":"chips"}},{"kind":"Field","name":{"kind":"Name","value":"scribelanes"}},{"kind":"Field","name":{"kind":"Name","value":"placements"}},{"kind":"Field","name":{"kind":"Name","value":"shotInfo"}},{"kind":"Field","name":{"kind":"Name","value":"config"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<GetLayoutsQuery, GetLayoutsQueryVariables>;
export const SaveLayoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveLayout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLayoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveLayout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<SaveLayoutMutation, SaveLayoutMutationVariables>;
export const GetProcessPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProcessPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"processPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designRule"}},{"kind":"Field","name":{"kind":"Name","value":"beolOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"metaInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"processId"}},{"kind":"Field","name":{"kind":"Name","value":"mtoDate"}},{"kind":"Field","name":{"kind":"Name","value":"customer"}},{"kind":"Field","name":{"kind":"Name","value":"application"}},{"kind":"Field","name":{"kind":"Name","value":"chipSizeX"}},{"kind":"Field","name":{"kind":"Name","value":"chipSizeY"}},{"kind":"Field","name":{"kind":"Name","value":"slSizeX"}},{"kind":"Field","name":{"kind":"Name","value":"slSizeY"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetProcessPlansQuery, GetProcessPlansQueryVariables>;
export const CreateProcessPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProcessPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProcessPlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProcessPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"designRule"}}]}}]}}]} as unknown as DocumentNode<CreateProcessPlanMutation, CreateProcessPlanMutationVariables>;
export const CreateBeolOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBeolOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBeolOptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBeolOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}}]}}]}}]} as unknown as DocumentNode<CreateBeolOptionMutation, CreateBeolOptionMutationVariables>;
export const CreateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}}]}}]}}]} as unknown as DocumentNode<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"metaInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"processId"}},{"kind":"Field","name":{"kind":"Name","value":"mtoDate"}},{"kind":"Field","name":{"kind":"Name","value":"customer"}},{"kind":"Field","name":{"kind":"Name","value":"application"}},{"kind":"Field","name":{"kind":"Name","value":"chipSizeX"}},{"kind":"Field","name":{"kind":"Name","value":"chipSizeY"}},{"kind":"Field","name":{"kind":"Name","value":"slSizeX"}},{"kind":"Field","name":{"kind":"Name","value":"slSizeY"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteProductMutation, DeleteProductMutationVariables>;
export const CreateRequestItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRequestItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRequestItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRequestItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"pkdVersions"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateRequestItemMutation, CreateRequestItemMutationVariables>;
export const UpdateRequestItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRequestItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRequestItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRequestItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"pkdVersions"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateRequestItemMutation, UpdateRequestItemMutationVariables>;
export const DeleteRequestItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRequestItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRequestItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteRequestItemMutation, DeleteRequestItemMutationVariables>;
export const GetRequestsByProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRequestsByProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestItemsByProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"pkdVersions"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"stepOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"workContent"}},{"kind":"Field","name":{"kind":"Name","value":"workerId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetRequestsByProductQuery, GetRequestsByProductQueryVariables>;
export const GetAllRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"pkdVersions"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"assignees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"stepOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"workContent"}},{"kind":"Field","name":{"kind":"Name","value":"workerId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetAllRequestsQuery, GetAllRequestsQueryVariables>;
export const GetRequestItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRequestItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"edmList"}},{"kind":"Field","name":{"kind":"Name","value":"pkdVersions"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignees"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"stepOrder"}},{"kind":"Field","name":{"kind":"Name","value":"stepName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"workContent"}},{"kind":"Field","name":{"kind":"Name","value":"workerId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetRequestItemQuery, GetRequestItemQueryVariables>;
export const AssignUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}}]}}]}}]} as unknown as DocumentNode<AssignUserMutation, AssignUserMutationVariables>;
export const RemoveAssigneeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAssignee"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAssignee"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RemoveAssigneeMutation, RemoveAssigneeMutationVariables>;
export const UpdateRequestStepDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRequestStep"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStepInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRequestStep"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"workContent"}},{"kind":"Field","name":{"kind":"Name","value":"workerId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateRequestStepMutation, UpdateRequestStepMutationVariables>;
export const GetPhotoKeysForRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPhotoKeysForRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beolOptionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"processPlanId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"photoKeys"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"beolOptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beolOptionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"processPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"processPlanId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tableName"}},{"kind":"Field","name":{"kind":"Name","value":"revNo"}},{"kind":"Field","name":{"kind":"Name","value":"rfgCategory"}},{"kind":"Field","name":{"kind":"Name","value":"photoCategory"}},{"kind":"Field","name":{"kind":"Name","value":"isReference"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"updateDate"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"processPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"beolOptionId"}},{"kind":"Field","name":{"kind":"Name","value":"workbookData"}}]}}]}}]} as unknown as DocumentNode<GetPhotoKeysForRequestQuery, GetPhotoKeysForRequestQueryVariables>;
export const CreateStreamInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStreamInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStreamInfoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStreamInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"streamPath"}},{"kind":"Field","name":{"kind":"Name","value":"streamInputOutputFile"}}]}}]}}]} as unknown as DocumentNode<CreateStreamInfoMutation, CreateStreamInfoMutationVariables>;
export const GetStreamInfosByProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStreamInfosByProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamInfosByProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestId"}},{"kind":"Field","name":{"kind":"Name","value":"streamPath"}},{"kind":"Field","name":{"kind":"Name","value":"streamInputOutputFile"}}]}}]}}]} as unknown as DocumentNode<GetStreamInfosByProductQuery, GetStreamInfosByProductQueryVariables>;
export const GetStreamInfoByRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStreamInfoByRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamInfoByRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"streamPath"}},{"kind":"Field","name":{"kind":"Name","value":"streamInputOutputFile"}}]}}]}}]} as unknown as DocumentNode<GetStreamInfoByRequestQuery, GetStreamInfoByRequestQueryVariables>;
export const SaveRequestTablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveRequestTables"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaveRequestTablesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveRequestTables"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoKeyId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SaveRequestTablesMutation, SaveRequestTablesMutationVariables>;
export const GetRequestTablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRequestTables"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestTables"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"requestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoKeyId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<GetRequestTablesQuery, GetRequestTablesQueryVariables>;