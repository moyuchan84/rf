export interface ProductMeta {
  id: number;
  productId: number;
  processId?: string;
  mtoDate?: string | Date;
  customer?: string;
  application?: string;
  chipSizeX?: number;
  chipSizeY?: number;
  slSizeX?: number;
  slSizeY?: number;
}

export interface RequestItem {
  id: number;
  productId: number;
  title: string;
  description: string;
  edmList: string[];
  pkdVersions: string[];
  requesterId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Product {
  id: number;
  partId: string;
  productName: string;
  beolOptionId: number;
  metaInfo?: ProductMeta;
  requests?: RequestItem[];
}

export interface BeolOption {
  id: number;
  optionName: string;
  processPlanId: number;
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
