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
    // 실제 개발 환경에서는 mock login page로 가거나 바로 callback으로 POST를 쏘는 UI가 필요함
    // 여기서는 단순히 로그인 URL을 반환 (프론트에서 처리 필요)
    return '/auth/sso/callback';
  }
}
