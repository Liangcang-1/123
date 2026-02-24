import { Injectable } from '@nestjs/common';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class ProviderRegistry {
  private readonly providers = new Map<string, AiProvider>();

  register(provider: AiProvider) {
    this.providers.set(provider.providerKey(), provider);
  }

  get(providerKey: string) {
    const provider = this.providers.get(providerKey);
    if (!provider) {
      throw new Error(`Provider not found: ${providerKey}`);
    }
    return provider;
  }
}
