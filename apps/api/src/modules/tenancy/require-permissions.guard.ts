import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';
import { TenantContext } from './tenant-context';

@Injectable()
export class RequirePermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tenantContext: TenantContext) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const allowed = new Set(this.tenantContext.permissions || []);
    const ok = required.every((key) => allowed.has(key));
    if (!ok) {
      throw new ForbiddenException({ code: 'PERMISSION_DENIED', message: '权限不足' });
    }
    return true;
  }
}
