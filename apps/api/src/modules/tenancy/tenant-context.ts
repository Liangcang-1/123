import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  tenantId: string | null = null;
  userId: string | null = null;
  roleKey: string | null = null;
  permissions: string[] = [];
}
