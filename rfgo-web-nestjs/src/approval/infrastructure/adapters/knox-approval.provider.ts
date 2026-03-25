import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApprovalProvider, ApprovalRequestDto } from '../../domain/approval-provider.interface';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class KnoxApprovalProvider extends ApprovalProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async submit(dto: ApprovalRequestDto) {
    const apiUrl = this.config.get<string>('knox.approvalApiUrl') || 'https://api.knox.samsung.com/approval';
    
    // Knox Approval Specific Payload mapping if needed
    const payload = {
      title: dto.title,
      contents: dto.contents,
      aplns: dto.aplns,
      requesterId: dto.requesterId
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(apiUrl, payload)
      );

      return response.data;
    } catch (error) {
      console.error('[KnoxApprovalProvider] Approval submission failed:', error);
      return {
        result: 'error',
        message: error.message
      };
    }
  }
}
