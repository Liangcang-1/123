import { BadRequestException } from '@nestjs/common';
import { ProviderKey } from './config.types';

const ALLOWED_ENDPOINT_HOSTS = ['api.openai.com', 'api.runninghub.cn', 'api.runninghub.com'];

function validateEndpoint(urlLike: string) {
  let host: string;
  try {
    host = new URL(urlLike).host;
  } catch {
    throw new BadRequestException('Invalid endpoint URL');
  }
  if (!ALLOWED_ENDPOINT_HOSTS.includes(host)) {
    throw new BadRequestException('Endpoint host not in whitelist');
  }
}

export function validateProviderConfig(providerKey: ProviderKey, config: Record<string, unknown>) {
  if (providerKey === 'openai_chat') {
    if (typeof config.model !== 'string') throw new BadRequestException('openai_chat.model is required');
    if (typeof config.temperature !== 'number') throw new BadRequestException('openai_chat.temperature must be number');
    if (typeof config.timeout !== 'number') throw new BadRequestException('openai_chat.timeout must be number');
    if (typeof config.retry !== 'number') throw new BadRequestException('openai_chat.retry must be number');
    if (config.endpoint) validateEndpoint(String(config.endpoint));
    return;
  }

  if (providerKey === 'runninghub') {
    if (typeof config.endpoint !== 'string') throw new BadRequestException('runninghub.endpoint is required');
    if (typeof config.queue_limit !== 'number') throw new BadRequestException('runninghub.queue_limit must be number');
    if (typeof config.timeout !== 'number') throw new BadRequestException('runninghub.timeout must be number');
    validateEndpoint(String(config.endpoint));
    return;
  }

  if (providerKey === 'storage') {
    if (typeof config.bucket !== 'string') throw new BadRequestException('storage.bucket is required');
    if (typeof config.region !== 'string') throw new BadRequestException('storage.region is required');
    if (typeof config.endpoint !== 'string') throw new BadRequestException('storage.endpoint is required');
    validateEndpoint(String(config.endpoint));
  }
}
