import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  AssetEntity,
  AssetFolderEntity,
  CatalogTemplateEntity,
  CatalogToolEntity,
  GenTaskEntity,
  MenuGroupEntity,
  MenuItemEntity,
  TenantEntitlementEntity,
  TenantEntity,
  TenantUserEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UsageLedgerEntity,
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
    @InjectRepository(GenTaskEntity) private readonly taskRepo: Repository<GenTaskEntity>,
    @InjectRepository(AssetEntity) private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetFolderEntity) private readonly folderRepo: Repository<AssetFolderEntity>,
    @InjectRepository(UsageLedgerEntity) private readonly usageRepo: Repository<UsageLedgerEntity>,
    @InjectRepository(TenantUserEntity) private readonly tenantUserRepo: Repository<TenantUserEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity) private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity) private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.tenantRepo.count();
    if (count > 0) return;

    const tenant = await this.tenantRepo.save(this.tenantRepo.create({ name: '演示商家', slug: 'demo-tenant', plan: 'pro' }));
    const admin = await this.userRepo.save(this.userRepo.create({ tenantId: tenant.id, email: 'admin@example.com', passwordHash: hashSync('password123', 10), displayName: 'Demo Admin', status: 'active', role: 'ADMIN' }));
    const merchant = await this.userRepo.save(this.userRepo.create({ tenantId: tenant.id, email: 'owner@example.com', passwordHash: hashSync('password123', 10), displayName: 'Demo Owner', status: 'active', role: 'OWNER' }));


    const systemRoles = await this.roleRepo.save([
      this.roleRepo.create({ tenantId: null, key: 'owner', name: 'Owner' }),
      this.roleRepo.create({ tenantId: null, key: 'admin', name: 'Admin' }),
      this.roleRepo.create({ tenantId: null, key: 'member', name: 'Member' }),
    ]);

    const permissions = await this.permissionRepo.save([
      this.permissionRepo.create({ key: 'tool.read', name: 'Read tools' }),
      this.permissionRepo.create({ key: 'tool.manage', name: 'Manage tools' }),
      this.permissionRepo.create({ key: 'job.read', name: 'Read jobs' }),
      this.permissionRepo.create({ key: 'job.manage', name: 'Manage jobs' }),
      this.permissionRepo.create({ key: 'asset.read', name: 'Read assets' }),
      this.permissionRepo.create({ key: 'asset.manage', name: 'Manage assets' }),
      this.permissionRepo.create({ key: 'billing.read', name: 'Read billing' }),
      this.permissionRepo.create({ key: 'billing.manage', name: 'Manage billing' }),
    ]);

    const ownerRole = systemRoles.find((r) => r.key === 'owner');
    if (ownerRole) {
      await this.rolePermissionRepo.save(
        permissions.map((p) => this.rolePermissionRepo.create({ roleId: ownerRole.id, permissionId: p.id })),
      );
      await this.tenantUserRepo.save(this.tenantUserRepo.create({ tenantId: tenant.id, userId: merchant.id, roleId: ownerRole.id, status: 'active' }));
      await this.tenantUserRepo.save(this.tenantUserRepo.create({ tenantId: tenant.id, userId: admin.id, roleId: ownerRole.id, status: 'active' }));
    }

    const presetBase = {
      scenes: { values: ['上新', '大促', '直播间'] },
      examples: { samples: ['简洁高转化', '氛围感强', '平台规范'] },
      presets: [
        { name: '高转化', values: { tone: '促销', style: '电商爆款' } },
        { name: '品牌感', values: { tone: '高级', style: '品牌视觉' } },
        { name: '活动冲刺', values: { tone: '紧迫', style: '限时活动' } },
      ],
    };

    const templates = await this.templateRepo.save([
      this.templateRepo.create({ providerTemplateId: 'tpl-main-image', key: 'main-image', name: '商品主图生成', category: 'ecom_image', description: '生成上新主图', inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] }, outputSchema: { type: 'image' }, costHint: '约 1 点/次', ...presetBase }),
      this.templateRepo.create({ providerTemplateId: 'tpl-poster', key: 'promo-poster', name: '活动海报生成', category: 'poster', description: '大促海报生成', inputSchema: { fields: [{ name: 'campaign', type: 'text', required: true }] }, outputSchema: { type: 'image' }, costHint: '约 2 点/次', ...presetBase }),
      this.templateRepo.create({ providerTemplateId: 'tpl-detail', key: 'detail-page', name: '详情页结构与文案', category: 'ecom_copy', description: '详情页分段文案', inputSchema: { fields: [{ name: 'selling_points', type: 'textarea', required: true }] }, outputSchema: { type: 'text' }, costHint: '约 1 点/次', ...presetBase }),
    ]);

    const tools = await this.toolRepo.save([
      this.toolRepo.create({ providerToolId: 'tool-title', key: 'title-copy', name: '标题卖点优化', category: 'ecom_copy', description: '生成标题与卖点组合', inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] }, outputSchema: { type: 'text' }, costHint: '约 1 点/次', ...presetBase }),
      this.toolRepo.create({ providerToolId: 'tool-video-script', key: 'video-script', name: '短视频脚本', category: 'video_script', description: '生成短视频分镜脚本', inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] }, outputSchema: { type: 'text' }, costHint: '约 2 点/次', ...presetBase }),
      this.toolRepo.create({ providerToolId: 'tool-live', key: 'live-pitch', name: '直播话术', category: 'live_stream', description: '直播间话术建议', inputSchema: { fields: [{ name: 'product_name', type: 'text', required: true }] }, outputSchema: { type: 'text' }, costHint: '约 1 点/次', ...presetBase }),
    ]);

    const groups = await this.menuGroupRepo.save([
      this.menuGroupRepo.create({ scope: 'global', name: '商品上新', icon: 'PackagePlus', sort: 1 }),
      this.menuGroupRepo.create({ scope: 'global', name: '活动营销', icon: 'Megaphone', sort: 2 }),
      this.menuGroupRepo.create({ scope: 'global', name: '店铺运营', icon: 'Store', sort: 3 }),
      this.menuGroupRepo.create({ scope: 'global', name: '素材与任务', icon: 'FolderKanban', sort: 4 }),
      this.menuGroupRepo.create({ scope: 'global', name: '设置', icon: 'Settings', sort: 5 }),
    ]);

    await this.menuItemRepo.save([
      this.menuItemRepo.create({ groupId: groups[0].id, itemType: 'template', itemId: templates[0].id, title: '商品主图生成', icon: 'Image', sort: 1, pinned: true, category: '上新', costHint: '1 点/次' }),
      this.menuItemRepo.create({ groupId: groups[0].id, itemType: 'tool', itemId: tools[0].id, title: '标题卖点优化', icon: 'Heading', sort: 2, pinned: true, category: '上新', costHint: '1 点/次' }),
      this.menuItemRepo.create({ groupId: groups[1].id, itemType: 'template', itemId: templates[1].id, title: '活动海报生成', icon: 'ImagePlus', sort: 1, category: '营销', costHint: '2 点/次' }),
      this.menuItemRepo.create({ groupId: groups[1].id, itemType: 'tool', itemId: tools[1].id, title: '短视频脚本', icon: 'Clapperboard', sort: 2, category: '营销', costHint: '2 点/次' }),
      this.menuItemRepo.create({ groupId: groups[2].id, itemType: 'template', itemId: templates[2].id, title: '详情页结构与文案', icon: 'FileText', sort: 1, category: '运营', costHint: '1 点/次' }),
      this.menuItemRepo.create({ groupId: groups[2].id, itemType: 'tool', itemId: tools[2].id, title: '直播话术', icon: 'Mic', sort: 2, category: '运营', costHint: '1 点/次', grayRelease: true, disabledReason: '需升级专业版' }),
      this.menuItemRepo.create({ groupId: groups[3].id, itemType: 'page', pagePath: '/tasks', title: '任务中心', icon: 'ListTodo', sort: 1 }),
      this.menuItemRepo.create({ groupId: groups[3].id, itemType: 'page', pagePath: '/assets', title: '素材库', icon: 'Folder', sort: 2 }),
      this.menuItemRepo.create({ groupId: groups[4].id, itemType: 'page', pagePath: '/billing', title: '账单与用量', icon: 'Wallet', sort: 1 }),
    ]);

    await this.entitlementRepo.save([
      ...templates.map((t) => this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'template', itemId: t.id, enabled: true })),
      this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'tool', itemId: tools[0].id, enabled: true }),
      this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'tool', itemId: tools[1].id, enabled: true }),
      this.entitlementRepo.create({ tenantId: tenant.id, itemType: 'tool', itemId: tools[2].id, enabled: false }),
    ]);

    const folder = await this.folderRepo.save(this.folderRepo.create({ tenantId: tenant.id, name: '默认素材夹', parentId: null }));
    const task = await this.taskRepo.save(this.taskRepo.create({
      tenantId: tenant.id,
      userId: merchant.id,
      type: 'template',
      templateId: templates[0].id,
      workflowKey: 'template',
      status: 'succeeded',
      input: { product_name: '示例商品' },
      output: { result: '示例输出' },
      progress: 100,
      resultUrl: 'https://example.com/demo-asset.png',
      providerTaskId: 'demo_provider_task',
    }));

    await this.assetRepo.save(this.assetRepo.create({
      tenantId: tenant.id,
      taskId: task.id,
      sourceTaskId: task.id,
      folderId: folder.id,
      type: 'image',
      title: '示例主图素材',
      tags: ['上新', '主图'],
      contentUrl: 'https://example.com/demo-asset.png',
      meta: { demo: true },
    }));

    await this.usageRepo.save(this.usageRepo.create({
      tenantId: tenant.id,
      userId: admin.id,
      resourceType: 'generation',
      amount: 5,
      reason: 'seed_usage',
      taskId: task.id,
    }));
  }
}
