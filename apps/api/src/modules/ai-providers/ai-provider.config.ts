import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiProviderConfigService {
  constructor(private readonly configService: ConfigService) {}

  getDefaultProviderKey() {
    return this.configService.get<string>('AI_DEFAULT_PROVIDER') || 'mock';
  }

  getProviderABaseUrl() {
    return this.configService.get<string>('RUNNINGHUB_BASE_URL') || '';
  }

  getProviderAApiKey() {
    return this.configService.get<string>('RUNNINGHUB_API_KEY') || '';
  }

  getProviderAWebhookSecret() {
    return this.configService.get<string>('RUNNINGHUB_WEBHOOK_SECRET') || '';
  }
}
