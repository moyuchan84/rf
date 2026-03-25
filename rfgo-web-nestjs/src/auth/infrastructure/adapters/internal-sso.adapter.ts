import { Injectable } from '@nestjs/common';
import { SsoAdapter } from './sso.adapter';
import { SsoUserProfile } from '../../domain/sso-user-profile';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalSsoAdapter implements SsoAdapter {
  constructor(private configService: ConfigService) {}

  async validate(idToken: string): Promise<SsoUserProfile> {
    // 실제 사내 API 호출 로직 (id_token 검증 및 프로필 획득)
    // const ssoUrl = this.configService.get('sso.tokenUrl');
    // const response = await axios.post(ssoUrl, { id_token: idToken });
    // return response.data;
    
    // 임시 구현 (실제 API 구현 시 수정 필요)
    throw new Error('Internal SSO validate logic needs full implementation with actual API specs');
  }

  getLoginUrl(): string {
    const authUrl = this.configService.get('sso.authUrl');
    const clientId = this.configService.get('sso.clientId');
    const redirectUri = this.configService.get('sso.redirectUri');
    
    return `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  }
}
