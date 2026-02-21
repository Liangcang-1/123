import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly jwtService: JwtService, private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
      secret: process.env.JWT_SECRET || 'dev-secret',
    });
    return this.authService.me(payload.sub);
  }
}
