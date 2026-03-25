import { Controller, Get, Post, Res, Req, Body } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('sso/login')
  async login(@Res() res: Response) {
    const url = this.authService.getLoginUrl();
    return res.redirect(url);
  }

  @Post('sso/callback')
  async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('id_token') idToken: string,
  ) {
    // 사내 인터페이스: POST로 들어오고 body에 id_token이 포함됨
    const { access_token } = await this.authService.authenticate(idToken);
    
    // JWT를 HttpOnly 쿠키에 저장
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: this.configService.get('nodeEnv') === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const frontendUrl = this.configService.get('frontendUrl');
    
    // 프론트엔드로 리다이렉트 (POST 후 리다이렉트는 303 See Other가 적절할 수 있음)
    return res.redirect(frontendUrl);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    const frontendUrl = this.configService.get('frontendUrl');

    return res.redirect(frontendUrl);
  }
}
