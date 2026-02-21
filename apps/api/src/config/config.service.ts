import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { ProviderConfigEntity } from '../database/entities';
import { ProviderKey } from './config.types';

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly inMemoryConfig = new Map<ProviderKey, Record<string, unknown>>();

  constructor(
    @InjectRepository(ProviderConfigEntity)
    private readonly providerConfigRepo: Repository<ProviderConfigEntity>,
  ) {}

  async onModuleInit() {
    await this.preloadActiveConfigs();
    if (!process.env.REDIS_URL) return;
    const subscriber = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    await subscriber.subscribe('config_updated');
    subscriber.on('message', async (_, providerKey) => {
      await this.refreshConfigCache(providerKey as ProviderKey);
    });
  }

  async preloadActiveConfigs() {
    const configs = await this.providerConfigRepo.find({ where: { isActive: true } });
    configs.forEach((cfg) => this.inMemoryConfig.set(cfg.providerKey, cfg.configJson));
  }

  async loadProviderConfig(providerKey: ProviderKey) {
    const cfg = await this.providerConfigRepo.findOne({ where: { providerKey, isActive: true } });
    if (!cfg) return null;
    this.inMemoryConfig.set(providerKey, cfg.configJson);
    return cfg.configJson;
  }

  async getActiveConfig(providerKey: ProviderKey) {
    const cached = this.inMemoryConfig.get(providerKey);
    if (cached) return cached;
    return this.loadProviderConfig(providerKey);
  }

  async refreshConfigCache(providerKey: ProviderKey) {
    await this.loadProviderConfig(providerKey);
  }
}
