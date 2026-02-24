import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { In, Repository } from 'typeorm';
import { PermissionEntity, RolePermissionEntity, RoleEntity, TenantUserEntity } from '../../database/entities';
import { TenantContext } from './tenant-context';

@Injectable()
export class TenancyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantContext: TenantContext,
    @InjectRepository(TenantUserEntity) private readonly tenantUserRepo: Repository<TenantUserEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity) private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
    @InjectRepository(PermissionEntity) private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.path || '';

    if (path.startsWith('/api/auth') || path === '/api/health' || path.startsWith('/auth') || path === '/health') {
      return true;
    }

    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
    if (!token) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '登录已过期' });

    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, { secret: process.env.JWT_SECRET || 'dev-secret' });
    const userId = payload.sub;

    if (path === '/api/me/tenants' || path === '/me/tenants') {
      req['userId'] = userId;
      this.tenantContext.userId = userId;
      return true;
    }

    const tenantId = (req.headers['x-tenant-id'] as string | undefined) || null;
    if (!tenantId) {
      throw new BadRequestException({ code: 'TENANT_HEADER_REQUIRED', message: '缺少 X-Tenant-Id 请求头' });
    }

    const membership = await this.tenantUserRepo.findOne({ where: { tenantId, userId, status: 'active' } });
    if (!membership) {
      throw new ForbiddenException({ code: 'TENANT_ACCESS_DENIED', message: '租户访问受限' });
    }

    const role = membership.roleId ? await this.roleRepo.findOne({ where: { id: membership.roleId } }) : null;
    const rolePermissions = membership.roleId
      ? await this.rolePermissionRepo.find({ where: { roleId: membership.roleId } })
      : [];
    const permissionIds = rolePermissions.map((rp) => rp.permissionId);
    const permissions = permissionIds.length
      ? await this.permissionRepo.find({ where: { id: In(permissionIds) } })
      : [];

    req['tenantId'] = tenantId;
    req['userId'] = userId;
    req['roleKey'] = role?.key || null;
    req['permissions'] = permissions.map((x) => x.key);

    this.tenantContext.tenantId = tenantId;
    this.tenantContext.userId = userId;
    this.tenantContext.roleKey = role?.key || null;
    this.tenantContext.permissions = permissions.map((x) => x.key);

    return true;
  }
}
