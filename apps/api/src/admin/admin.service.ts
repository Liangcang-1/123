import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  AdminLogEntity,
  ProviderConfigEntity,
  ProviderConfigVersionEntity,
  SecretVaultEntity,
} from '../database/entities';
import { validateProviderConfig } from '../config/config.schemas';
import { ProviderKey } from '../config/config.types';

type SaveProviderPayload = {
  providerKey: ProviderKey;
  configJson: Record<string, unknown>;
  changeNote: string;
  adminId: string;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ProviderConfigEntity)
    private readonly providerConfigRepo: Repository<ProviderConfigEntity>,
    @InjectRepository(ProviderConfigVersionEntity)
    private readonly versionRepo: Repository<ProviderConfigVersionEntity>,
    @InjectRepository(SecretVaultEntity)
    private readonly secretRepo: Repository<SecretVaultEntity>,
    @InjectRepository(AdminLogEntity)
    private readonly adminLogRepo: Repository<AdminLogEntity>,
  ) {}

  listProviderConfigs() {
    return this.providerConfigRepo.find({ order: { providerKey: 'ASC' } });
  }

  async saveProviderConfig(payload: SaveProviderPayload) {
    validateProviderConfig(payload.providerKey, payload.configJson);

    const latestVersion = await this.versionRepo.findOne({
      where: { providerKey: payload.providerKey },
      order: { version: 'DESC' },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;

    await this.versionRepo.save(
      this.versionRepo.create({
        providerKey: payload.providerKey,
        version: nextVersion,
        configJson: payload.configJson,
        changeNote: payload.changeNote,
        createdByAdminId: payload.adminId,
      }),
    );

    const current = await this.providerConfigRepo.findOne({ where: { providerKey: payload.providerKey } });
    await this.providerConfigRepo.save(
      this.providerConfigRepo.create({
        id: current?.id,
        providerKey: payload.providerKey,
        configJson: payload.configJson,
        isActive: true,
        updatedByAdminId: payload.adminId,
      }),
    );

    await this.writeAudit(payload.adminId, 'provider_config.save', 'provider_config', payload.providerKey, {
      version: nextVersion,
      note: payload.changeNote,
    });

    await this.publishConfigUpdated(payload.providerKey);
    return { providerKey: payload.providerKey, version: nextVersion };
  }

  async createConfigVersion(payload: SaveProviderPayload) {
    return this.saveProviderConfig(payload);
  }

  async rollbackProviderConfig(providerKey: ProviderKey, version: number, adminId: string, changeNote: string) {
    const historical = await this.versionRepo.findOne({ where: { providerKey, version } });
    if (!historical) throw new BadRequestException('Version not found');

    return this.saveProviderConfig({
      providerKey,
      configJson: historical.configJson,
      adminId,
      changeNote: changeNote || `Rollback to version ${version}`,
    });
  }

  async upsertSecret(secretKey: string, plainValue: string, adminId: string) {
    const encrypted = this.encryptValue(plainValue);
    const current = await this.secretRepo.findOne({ where: { secretKey } });
    const secret = await this.secretRepo.save(
      this.secretRepo.create({
        id: current?.id,
        secretKey,
        encryptedValue: encrypted,
        isActive: true,
        rotatedAt: new Date(),
        updatedByAdminId: adminId,
      }),
    );

    await this.writeAudit(adminId, 'secret.save', 'secret', secret.id, { secretKey });
    return { id: secret.id, secretKey: secret.secretKey, rotatedAt: secret.rotatedAt };
  }

  async rotateSecret(secretKey: string, plainValue: string, adminId: string) {
    return this.upsertSecret(secretKey, plainValue, adminId);
  }

  async getSecretValue(secretKey: string) {
    const secret = await this.secretRepo.findOne({ where: { secretKey, isActive: true } });
    if (!secret) return null;
    return this.decryptValue(secret.encryptedValue);
  }

  getAuditLogs() {
    return this.adminLogRepo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  private getMasterKey() {
    const raw = process.env.MASTER_KEY || 'unsafe-dev-master-key-change-in-prod';
    return createHash('sha256').update(raw).digest();
  }

  private encryptValue(plainText: string) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.getMasterKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decryptValue(payload: string) {
    const [ivHex, encryptedHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.getMasterKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }

  private async publishConfigUpdated(providerKey: ProviderKey) {
    if (!process.env.REDIS_URL) return;
    const pub = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    await pub.publish('config_updated', providerKey);
    await pub.quit();
  }

  private async writeAudit(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.adminLogRepo.save(
      this.adminLogRepo.create({
        adminId,
        action,
        targetType,
        targetId,
        metadata,
      }),
    );
  }
}
