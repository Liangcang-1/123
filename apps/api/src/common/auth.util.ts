import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

export async function getAuthUser(jwtService: JwtService, authHeader?: string) {
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new UnauthorizedException('Missing token');
  return jwtService.verifyAsync<{ sub: string; tenantId?: string; role?: string }>(token, {
    secret: process.env.JWT_SECRET || 'dev-secret',
  });
}
