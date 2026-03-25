import { ApprovalPathItem } from '../approval.dto';

export class ApprovalRequestDto {
  contents: string;
  aplns: ApprovalPathItem[];
  title: string;
  requesterId: string;
}

export abstract class ApprovalProvider {
  abstract submit(dto: ApprovalRequestDto): Promise<{ result: string; apInfId?: string; message?: string }>;
}
