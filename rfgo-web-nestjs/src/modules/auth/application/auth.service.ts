import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma.service';
import { SsoAdapter } from '../infrastructure/adapters/sso.adapter';
import { SsoUserProfile } from '../domain/sso-user-profile';
import { RoleName } from '../domain/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private ssoAdapter: SsoAdapter,
  ) {}

  async authenticate(code: string) {
    const profile = await this.ssoAdapter.validate(code);
    if (!profile) {
      throw new UnauthorizedException('SSO authentication failed');
    }

    let user = await this.prisma.user.findUnique({
      where: { userId: profile.userId },
      include: { role: true },
    });

    if (!user) {
      // 첫 접속 시 자동 가입 (기본 USER 권한)
      let defaultRole = await this.prisma.role.findUnique({
        where: { name: RoleName.USER },
      });

      if (!defaultRole) {
        // 초기 데이터가 없을 경우 생성
        defaultRole = await this.prisma.role.create({
          data: { name: RoleName.USER, description: 'Default system user' },
        });
      }

      user = await this.prisma.user.create({
        data: {
          epId: profile.epId,
          userId: profile.userId,
          fullName: profile.fullName,
          deptName: profile.deptName,
          email: profile.email,
          roleId: defaultRole.id,
        },
        include: { role: true },
      });
    }

    const payload = {
      sub: user.id,
      userId: user.userId,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      include: { role: true },
    });
  }

  getLoginUrl() {
    return this.ssoAdapter.getLoginUrl();
  }
}
