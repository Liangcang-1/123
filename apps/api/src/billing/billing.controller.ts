import { Controller, Get, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity, UsageLedgerEntity } from '../database/entities';
import { getOptionalAuthUser } from '../common/auth.util';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UsageLedgerEntity) private readonly usageRepo: Repository<UsageLedgerEntity>,
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  private async resolveTenant(authHeader?: string) {
    const auth = await getOptionalAuthUser(this.jwtService, authHeader);
    if (auth?.tenantId) return auth.tenantId;
    const tenant = await this.tenantRepo.findOne({ where: {}, order: { createdAt: 'ASC' } });
    return tenant?.id || '';
  }

  @Get('summary')
  async summary(@Headers('authorization') authHeader?: string) {
    const tenantId = await this.resolveTenant(authHeader);
    const rows = await this.usageRepo.find({ where: { tenantId } });
    const used = rows.reduce((sum, x) => sum + Number(x.amount), 0);
    const limit = 200;
    return { ok: true, data: { monthUsed: used, quota: limit, remaining: Math.max(limit - used, 0), plan: 'pro' } };
  }

  @Get('by-tool')
  async byTool(@Headers('authorization') authHeader?: string) {
    const tenantId = await this.resolveTenant(authHeader);
    const rows = await this.usageRepo.find({ where: { tenantId } });
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.reason, (map.get(r.reason) || 0) + Number(r.amount));
    return { ok: true, data: Array.from(map.entries()).map(([tool, amount]) => ({ tool, amount })).sort((a, b) => b.amount - a.amount) };
  }
}
