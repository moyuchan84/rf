export interface AxisDetail {
  pitch: number;
  cd: number;
}

export interface AxisInfo {
  w: AxisDetail;
  m: AxisDetail;
}

export interface ProcessPlan {
  id: number;
  designRule: string;
}

export interface KeyDesign {
  id: number;
  name: string;
  keyType: string;
  sizeX: number;
  sizeY: number;
  isVertical: boolean;
  isHorizontal: boolean;
  rotation: number;
  description?: string;
  gdsPath?: string;
  edmList: string[];
  xAxis: AxisInfo;
  yAxis: AxisInfo;
  images: string[];
  processPlans?: ProcessPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyDesignInput {
  name: string;
  keyType: string;
  sizeX: number;
  sizeY: number;
  isVertical: boolean;
  isHorizontal: boolean;
  rotation: number;
  description?: string;
  gdsPath?: string;
  edmList: string[];
  xAxis: AxisInfo;
  yAxis: AxisInfo;
  images: string[];
  processPlanIds: number[];
}

export interface UpdateKeyDesignInput extends Partial<CreateKeyDesignInput> {
  // Empty as it just partializes the create input
}
