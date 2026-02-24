import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity, TenantEntity, TenantUserEntity } from './database/entities';

@Controller()
export class AppController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @InjectRepository(TenantUserEntity) private readonly tenantUserRepo: Repository<TenantUserEntity>,
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
  ) {}

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

  @Get('me/tenants')
  async myTenants(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
      secret: process.env.JWT_SECRET || 'dev-secret',
    });

    const memberships = await this.tenantUserRepo.find({ where: { userId: payload.sub, status: 'active' } });
    const tenantIds = memberships.map((m) => m.tenantId);
    const roleIds = memberships.map((m) => m.roleId).filter(Boolean) as string[];
    const tenants = tenantIds.length ? await this.tenantRepo.find({ where: { id: In(tenantIds) } }) : [];
    const roles = roleIds.length ? await this.roleRepo.find({ where: { id: In(roleIds) } }) : [];
    const roleMap = new Map(roles.map((r) => [r.id, r.key]));

    return {
      ok: true,
      data: memberships.map((m) => {
        const tenant = tenants.find((t) => t.id === m.tenantId);
        return { tenantId: m.tenantId, name: tenant?.name || '', slug: tenant?.slug || null, roleKey: roleMap.get(m.roleId || '') || null };
      }),
    };
  }
}
