import { Injectable } from '@nestjs/common';
import { SsoAdapter } from './sso.adapter';
import { SsoUserProfile } from '../../domain/sso-user-profile';

@Injectable()
export class DevSsoAdapter implements SsoAdapter {
  async validate(code: string): Promise<SsoUserProfile> {
    // 로컬 개발용 가짜 데이터
    return {
      epId: '11112222',
      userId: 'admin_user',
      fullName: 'Admin Manager',
      deptName: 'Digital Transformation Team',
      email: 'admin@samsung.com',
    };
    // {
    //   epId: '12345678',
    //   userId: 'tester.dev',
    //   fullName: '테스터(개발)',
    //   deptName: 'DX부문',
    //   email: 'tester.dev@samsung.com',
    // };
  }

  getLoginUrl(): string {
    return '/auth/sso/callback?code=dev-mock-code';
  }
}
