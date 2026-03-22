import { Injectable } from '@nestjs/common';
import { SsoAdapter } from './sso.adapter';
import { SsoUserProfile } from '../../domain/sso-user-profile';

@Injectable()
export class InternalSsoAdapter implements SsoAdapter {
  async validate(code: string): Promise<SsoUserProfile> {
    // 실제 사내 API 호출 로직 (향후 구현)
    // const response = await axios.post('https://sso.internal.com/token', { code });
    // return response.data;
    throw new Error('Internal SSO not implemented yet');
  }

  getLoginUrl(): string {
    return 'https://sso.internal.com/login?client_id=rfgo&redirect_uri=...';
  }
}
