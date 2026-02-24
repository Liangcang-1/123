import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  AdminLogEntity,
  CatalogTemplateEntity,
  CatalogToolEntity,
  MenuGroupEntity,
  MenuItemEntity,
  ProviderConfigEntity,
  ProviderConfigVersionEntity,
  SecretVaultEntity,
  TenantEntitlementEntity,
} from '../database/entities';
import { validateProviderConfig } from '../config/config.schemas';
import { ProviderKey } from '../config/config.types';
import { ProviderAAdapter } from '../providers/provider-a.adapter';

type SaveProviderPayload = {
  providerKey: ProviderKey;
  configJson: Record<string, unknown>;
  changeNote: string;
  adminId: string;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ProviderConfigEntity) private readonly providerConfigRepo: Repository<ProviderConfigEntity>,
    @InjectRepository(ProviderConfigVersionEntity) private readonly versionRepo: Repository<ProviderConfigVersionEntity>,
    @InjectRepository(SecretVaultEntity) private readonly secretRepo: Repository<SecretVaultEntity>,
    @InjectRepository(AdminLogEntity) private readonly adminLogRepo: Repository<AdminLogEntity>,
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
    @InjectRepository(MenuGroupEntity) private readonly menuGroupRepo: Repository<MenuGroupEntity>,
    @InjectRepository(MenuItemEntity) private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(TenantEntitlementEntity) private readonly entitlementRepo: Repository<TenantEntitlementEntity>,
    private readonly providerAdapter: ProviderAAdapter,
  ) {}

  listProviderConfigs() {
    return { ok: true, data: this.providerConfigRepo.find({ order: { providerKey: 'ASC' } }) };
  }

  async saveProviderConfig(payload: SaveProviderPayload) {
    validateProviderConfig(payload.providerKey, payload.configJson);
    const latestVersion = await this.versionRepo.findOne({ where: { providerKey: payload.providerKey }, order: { version: 'DESC' } });
    const nextVersion = (latestVersion?.version ?? 0) + 1;
    await this.versionRepo.save(this.versionRepo.create({
      providerKey: payload.providerKey,
      version: nextVersion,
      configJson: payload.configJson,
      changeNote: payload.changeNote,
      createdByAdminId: payload.adminId,
    }));

    const current = await this.providerConfigRepo.findOne({ where: { providerKey: payload.providerKey } });
    await this.providerConfigRepo.save(this.providerConfigRepo.create({
      id: current?.id,
      providerKey: payload.providerKey,
      configJson: payload.configJson,
      isActive: true,
      enabled: true,
      updatedByAdminId: payload.adminId,
    }));

    await this.writeAudit(payload.adminId, 'provider_config.save', 'provider_config', payload.providerKey, { version: nextVersion });
    await this.publishConfigUpdated(payload.providerKey);
    return { ok: true, data: { providerKey: payload.providerKey, version: nextVersion } };
  }

  async rollbackProviderConfig(providerKey: ProviderKey, version: number, adminId: string, changeNote: string) {
    const historical = await this.versionRepo.findOne({ where: { providerKey, version } });
    if (!historical) throw new BadRequestException('Version not found');
    return this.saveProviderConfig({ providerKey, configJson: historical.configJson, adminId, changeNote: changeNote || `Rollback to version ${version}` });
  }

  async syncCatalog(adminId: string) {
    const templates = await this.providerAdapter.listTemplates();
    const tools = await this.providerAdapter.listTools();
    for (const t of templates) {
      const existing = await this.templateRepo.findOne({ where: { key: t.key } });
      await this.templateRepo.save(this.templateRepo.create({ ...existing, ...t }));
    }
    for (const t of tools) {
      const existing = await this.toolRepo.findOne({ where: { key: t.key } });
      await this.toolRepo.save(this.toolRepo.create({ ...existing, ...t }));
    }
    await this.writeAudit(adminId, 'catalog.sync', 'catalog', 'all', { templates: templates.length, tools: tools.length });
    return { ok: true, data: { templates: templates.length, tools: tools.length } };
  }

  menuGroups() { return { ok: true, data: this.menuGroupRepo.find({ order: { sort: 'ASC' } }) }; }
  async saveMenuGroup(data: Partial<MenuGroupEntity>) { return { ok: true, data: await this.menuGroupRepo.save(this.menuGroupRepo.create(data)) }; }
  menuItems(groupId?: string) { return { ok: true, data: this.menuItemRepo.find({ where: groupId ? { groupId } : {}, order: { sort: 'ASC' } }) }; }
  async saveMenuItem(data: Partial<MenuItemEntity>) { return { ok: true, data: await this.menuItemRepo.save(this.menuItemRepo.create(data)) }; }
  listEntitlements(tenantId: string) { return { ok: true, data: this.entitlementRepo.find({ where: { tenantId } }) }; }
  async saveEntitlement(data: Partial<TenantEntitlementEntity>) { return { ok: true, data: await this.entitlementRepo.save(this.entitlementRepo.create(data)) }; }

  async upsertSecret(secretKey: string, plainValue: string, adminId: string) {
    const encrypted = this.encryptValue(plainValue);
    const current = await this.secretRepo.findOne({ where: { secretKey } });
    const secret = await this.secretRepo.save(this.secretRepo.create({ id: current?.id, secretKey, encryptedValue: encrypted, isActive: true, rotatedAt: new Date(), updatedByAdminId: adminId }));
    await this.writeAudit(adminId, 'secret.save', 'secret', secret.id, { secretKey });
    return { ok: true, data: { id: secret.id, secretKey: secret.secretKey, rotatedAt: secret.rotatedAt } };
  }

  async rotateSecret(secretKey: string, plainValue: string, adminId: string) { return this.upsertSecret(secretKey, plainValue, adminId); }
  async getSecretValue(secretKey: string) { const secret = await this.secretRepo.findOne({ where: { secretKey, isActive: true } }); return secret ? this.decryptValue(secret.encryptedValue) : null; }
  getAuditLogs() { return { ok: true, data: this.adminLogRepo.find({ order: { createdAt: 'DESC' }, take: 200 }) }; }

  private getMasterKey() { return createHash('sha256').update(process.env.MASTER_KEY || 'unsafe-dev-master-key-change-in-prod').digest(); }
  private encryptValue(plainText: string) { const iv = randomBytes(16); const cipher = createCipheriv('aes-256-cbc', this.getMasterKey(), iv); const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]); return `${iv.toString('hex')}:${encrypted.toString('hex')}`; }
  private decryptValue(payload: string) { const [ivHex, encryptedHex] = payload.split(':'); const iv = Buffer.from(ivHex, 'hex'); const encryptedText = Buffer.from(encryptedHex, 'hex'); const decipher = createDecipheriv('aes-256-cbc', this.getMasterKey(), iv); const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]); return decrypted.toString('utf8'); }
  private async publishConfigUpdated(providerKey: ProviderKey) { if (!process.env.REDIS_URL) return; const pub = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }); await pub.publish('config_updated', providerKey); await pub.quit(); }
  private async writeAudit(adminId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown>) { await this.adminLogRepo.save(this.adminLogRepo.create({ adminId, action, targetType, targetId, metadata })); }
}
