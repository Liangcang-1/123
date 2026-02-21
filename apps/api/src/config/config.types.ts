export type ProviderKey = 'openai_chat' | 'runninghub' | 'storage';

export type OpenAIChatConfig = {
  model: string;
  temperature: number;
  timeout: number;
  retry: number;
  endpoint?: string;
};

export type RunninghubConfig = {
  endpoint: string;
  api_key_secret_ref?: string;
  queue_limit: number;
  timeout: number;
};
