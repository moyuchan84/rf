import { Injectable } from '@nestjs/common';
import { ApprovalPathItem } from './approval.dto';

export class ApprovalRequestDto {
  contents: string;
  aplns: ApprovalPathItem[];
  title: string;
  requesterId: string;
}

export abstract class ApprovalProvider {
  abstract submit(dto: ApprovalRequestDto): Promise<{ result: string; apInfId?: string; message?: string }>;
}

@Injectable()
export class DevApprovalProvider extends ApprovalProvider {
  async submit(dto: ApprovalRequestDto) {
    console.log('--- [DEV Approval Submission] ---');
    console.log('Title:', dto.title);
    console.log('Requester:', dto.requesterId);
    console.log('Path:', dto.aplns);
    console.log('Contents (Length):', dto.contents.length);
    
    // Simulate successful submission
    return {
      result: 'success',
      apInfId: `DEV-AP-INF-${Date.now()}`
    };
  }
}
