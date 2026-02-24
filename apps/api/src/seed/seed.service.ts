import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  CatalogTemplateEntity,
  CatalogToolEntity,
  MenuGroupEntity,
  MenuItemEntity,
  TenantEntitlementEntity,
  TenantEntity,
  UserEntity,
} from '../database/entities';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
    @InjectRepository(MenuGroupEntity) private readonly menuGroupRepo: Repository<MenuGroupEntity>,
    @InjectRepository(MenuItemEntity) private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(TenantEntitlementEntity) private readonly entitlementRepo: Repository<TenantEntitlementEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.tenantRepo.count();
    if (count > 0) return;

    const tenant = await this.tenantRepo.save(this.tenantRepo.create({ name: '演示商家', plan: 'pro' }));
    await this.userRepo.save(this.userRepo.create({
      tenantId: tenant.id,
      email: 'owner@example.com',
      passwordHash: hashSync('password123', 10),
      role: 'OWNER',
    }));

    const template = await this.templateRepo.save(this.templateRepo.create({
      providerTemplateId: 'tpl-product-image',
      key: 'product-image-generator',
      name: '商品主图生成',
      category: 'ecom_image',
      description: '适用于上新商品主图',
      inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] },
      outputSchema: { type: 'image' },
    }));

    const tool = await this.toolRepo.save(this.toolRepo.create({
      providerToolId: 'tool-title-copy',
      key: 'title-copy-tool',
      name: '标题文案优化',
      category: 'ecom_copy',
      description: '为商品生成标题和卖点',
      inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] },
      outputSchema: { type: 'text' },
    }));

    const group = await this.menuGroupRepo.save(this.menuGroupRepo.create({ scope: 'global', name: 'AI 创作工具', icon: 'Sparkles', sort: 1 }));
    await this.menuItemRepo.save([
      this.menuItemRepo.create({ groupId: group.id, itemType: 'template', itemId: template.id, title: '商品主图生成', icon: 'Image', sort: 1, enabled: true }),
      this.menuItemRepo.create({ groupId: group.id, itemType: 'tool', itemId: tool.id, title: '标题文案优化', icon: 'FileText', sort: 2, enabled: true }),
      this.menuItemRepo.create({ groupId: group.id, itemType: 'page', pagePath: '/tasks', title: '任务中心', icon: 'ListTodo', sort: 3, enabled: true }),
    ]);

    await this.entitlementRepo.save([
      this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'template', itemId: template.id, enabled: true }),
      this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'tool', itemId: tool.id, enabled: true }),
    ]);
  }
}
