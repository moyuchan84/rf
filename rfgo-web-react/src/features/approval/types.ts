export enum ApprovalRole {
  DRAFT = '0',
  APPROVE = '1',
  CONSULT = '2',
  POST_APPROVE = '3',
  PARALLEL_CONSULT = '4',
  PARALLEL_APPROVE = '7',
  NOTIFY = '9'
}

export const APPROVAL_ROLE_LABELS: Record<ApprovalRole, string> = {
  [ApprovalRole.DRAFT]: '기안',
  [ApprovalRole.APPROVE]: '결재',
  [ApprovalRole.CONSULT]: '합의',
  [ApprovalRole.POST_APPROVE]: '후결',
  [ApprovalRole.PARALLEL_CONSULT]: '병렬합의',
  [ApprovalRole.PARALLEL_APPROVE]: '병렬결재',
  [ApprovalRole.NOTIFY]: '통보',
};

export interface ApprovalPathItem {
  epId: string;
  userId: string;
  fullName: string;
  email: string;
  role: string; // '0', '1', '2' 등
  aplnStatsCode: string;
  seq?: string;
}

export interface UserApprovalPath {
  id: number;
  userId: string;
  pathName: string;
  pathItems: ApprovalPathItem[];
}

export interface ApprovalResponse {
  result: string;
  apInfId?: string;
  message?: string;
}
