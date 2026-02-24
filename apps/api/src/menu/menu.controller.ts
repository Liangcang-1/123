import { Controller, Get, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogTemplateEntity, CatalogToolEntity, MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity } from '../database/entities';
import { getAuthUser } from '../common/auth.util';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(MenuGroupEntity) private readonly groupRepo: Repository<MenuGroupEntity>,
    @InjectRepository(MenuItemEntity) private readonly itemRepo: Repository<MenuItemEntity>,
    @InjectRepository(TenantEntitlementEntity) private readonly entitlementRepo: Repository<TenantEntitlementEntity>,
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
  ) {}

  @Get()
  async list(@Headers('authorization') authHeader?: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const groups = await this.groupRepo.find({ where: [{ scope: 'global' }, { scope: 'tenant', tenantId: user.tenantId }], order: { sort: 'ASC' } });
    const items = await this.itemRepo.find({ where: { enabled: true }, order: { sort: 'ASC' } });
    const entitlements = await this.entitlementRepo.find({ where: { tenantId: user.tenantId, enabled: true } });
    const allowed = new Set(entitlements.map((e) => `${e.itemType}:${e.itemId}`));

    const groupsData = [] as any[];
    for (const g of groups) {
      const child = items.filter((i) => i.groupId === g.id).filter((i) => {
        if (i.itemType === 'page') return true;
        if (!i.itemId) return false;
        return allowed.has(`${i.itemType}:${i.itemId}`);
      });
      groupsData.push({ ...g, items: child });
    }

    return { ok: true, data: groupsData };
  }
}
