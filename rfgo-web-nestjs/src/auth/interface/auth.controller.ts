import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import type { Response } from 'express';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sso/login')
  async login(@Res() res: Response) {
    const url = this.authService.getLoginUrl();
    return res.redirect(url);
  }

  @Get('sso/callback')
  async callback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.authenticate(code);
    
    // JWT를 HttpOnly 쿠키에 저장
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    
    // 프론트엔드로 리다이렉트
    return res.redirect(frontendUrl);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.redirect(frontendUrl);
  }
}
