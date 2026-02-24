export type ProviderKey = 'openai_chat' | 'provider_a' | 'runninghub' | 'storage';

export type OpenAIChatConfig = {
  model: string;
  temperature: number;
  timeout: number;
  retry: number;
  endpoint?: string;
};

export type ProviderAConfig = {
  endpoint: string;
  api_key_secret_ref?: string;
  queue_limit: number;
  timeout: number;
};
