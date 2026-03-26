import { Injectable } from '@nestjs/common';
import { SsoAdapter } from './sso.adapter';
import { SsoUserProfile } from '../../domain/sso-user-profile';

@Injectable()
export class DevSsoAdapter implements SsoAdapter {
  async validate(idToken: string): Promise<SsoUserProfile> {
    // 로컬 개발용 가짜 데이터 (idToken에 따라 다른 유저를 반환하거나 고정 데이터 사용)
    return {
      epId: '11112222',
      userId: idToken || 'admin_user',
      fullName: 'Admin Manager',
      deptName: 'Digital Transformation Team',
      email: 'admin@samsung.com',
    };
  }

  getLoginUrl(): string {
    // 로컬 개발 환경: id_token=admin_user를 쿼리스트링에 포함하여 콜백으로 리다이렉트
    return '/auth/sso/callback?id_token=admin_user';
  }
}
