export interface ProductMeta {
  id: number;
  productId: number;
  processId?: string;
  mtoDate?: string;
  customer?: string;
  application?: string;
  chipSizeX?: number;
  chipSizeY?: number;
  slSizeX?: number;
  slSizeY?: number;
}

export interface RequestAssignee {
  id: number;
  requestId: number;
  category: string;
  userId: string;
  userName: string;
}

export interface RequestStep {
  id: number;
  requestId: number;
  stepOrder: number;
  stepName: string;
  status: string;
  workContent?: string;
  workerId?: string;
  completedAt?: string;
}

export interface RequestItem {
  id: number;
  productId: number;
  requestType: string;
  title: string;
  description: string;
  edmList: string[];
  pkdVersions: string[];
  requesterId: string;
  createdAt: string;
  updatedAt: string;
  assignees?: RequestAssignee[];
  steps?: RequestStep[];
  product?: Product;
}

export interface Product {
  id: number;
  partId: string;
  productName: string;
  beolOptionId: number;
  beolOption?: BeolOption;
  metaInfo?: ProductMeta;
  requests?: RequestItem[];
  photoKeys?: PhotoKey[];
}

export interface PhotoKey {
  id: number;
  productId: number;
  processPlanId?: number | null;
  beolOptionId?: number | null;
  rfgCategory?: string | null;
  photoCategory?: string | null;
  isReference: boolean;
  tableName: string;
  revNo: number;
  filename?: string | null;
  rawBinary?: any;
  updater?: string | null;
  log?: string | null;
  workbookData?: any;
  updateDate: string;
}

export interface BeolOption {
  id: number;
  optionName: string;
  processPlanId: number;
  processPlan?: ProcessPlan;
  products: Product[];
}

export interface ProcessPlan {
  id: number;
  designRule: string;
  beolOptions: BeolOption[];
}

export type MasterDataType = 'plan' | 'option' | 'product';

export interface SelectedNode {
  type: MasterDataType;
  id: number;
  data: any;
  path: string[];
}
