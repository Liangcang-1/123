import { Controller, Get, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity, TenantEntity } from '../database/entities';
import { getOptionalAuthUser } from '../common/auth.util';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(MenuGroupEntity) private readonly groupRepo: Repository<MenuGroupEntity>,
    @InjectRepository(MenuItemEntity) private readonly itemRepo: Repository<MenuItemEntity>,
    @InjectRepository(TenantEntitlementEntity) private readonly entitlementRepo: Repository<TenantEntitlementEntity>,
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  @Get()
  async list(@Headers('authorization') authHeader?: string) {
    const auth = await getOptionalAuthUser(this.jwtService, authHeader);
    const fallbackTenant = await this.tenantRepo.findOne({ where: {}, order: { createdAt: 'ASC' } });
    const tenantId = auth?.tenantId || fallbackTenant?.id || '';

    const groups = await this.groupRepo.find({ where: [{ scope: 'global' }, { scope: 'tenant', tenantId }], order: { sort: 'ASC' } });
    const items = await this.itemRepo.find({ where: { enabled: true }, order: { sort: 'ASC' } });
    const entitlements = await this.entitlementRepo.find({ where: { tenantId } });
    const entitlementMap = new Map(entitlements.map((e) => [`${e.itemType}:${e.itemId}`, e.enabled]));

    const mappedItems = items.map((i) => {
      const key = i.itemId ? `${i.itemType}:${i.itemId}` : '';
      const enabled = i.itemType === 'page' ? true : Boolean(entitlementMap.get(key));
      return {
        id: i.id,
        groupId: i.groupId,
        itemType: i.itemType,
        itemId: i.itemId,
        pagePath: i.pagePath,
        title: i.title,
        subtitle: i.subtitle,
        icon: i.icon,
        sort: i.sort,
        pinned: i.pinned,
        category: i.category,
        costHint: i.costHint,
        isDisabled: !enabled,
        disabledReason: i.disabledReason || '当前套餐未开通此工具',
      };
    });

    const grouped = groups.map((g) => ({ id: g.id, name: g.name, icon: g.icon, sort: g.sort, items: mappedItems.filter((i) => i.groupId === g.id) }));
    return { ok: true, data: { version: Date.now(), groups: grouped, items: mappedItems } };
  }
}
