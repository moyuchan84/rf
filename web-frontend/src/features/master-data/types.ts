export interface ProductMeta {
  id: number;
  chip?: string;
  shot?: string;
  mto?: string;
}

export interface Product {
  id: number;
  partId: string;
  productName: string;
  metaInfo?: ProductMeta;
}

export interface BeolOption {
  id: number;
  optionName: string;
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
