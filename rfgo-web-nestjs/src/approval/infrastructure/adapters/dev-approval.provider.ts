import { Injectable } from '@nestjs/common';
import { ApprovalProvider, ApprovalRequestDto } from '../../domain/approval-provider.interface';

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
