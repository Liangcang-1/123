import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ExecuteWorkflowParams } from '../ai-provider.interface';
import { AiProviderConfigService } from '../ai-provider.config';
import { ProviderExecutionError } from '../ai-provider.errors';

const idempotencyMemory = new Map<string, { providerJobId: string; createdAt: number }>();

@Injectable()
export class ProviderAProvider implements AiProvider {
  private readonly logger = new Logger(ProviderAProvider.name);

  constructor(private readonly providerConfig: AiProviderConfigService) {}

  providerKey() {
    return 'runninghub';
  }

  async executeWorkflow(params: ExecuteWorkflowParams) {
    const baseUrl = this.providerConfig.getProviderABaseUrl();
    const apiKey = this.providerConfig.getProviderAApiKey();

    if (!baseUrl || !apiKey) {
      throw new ProviderExecutionError('PROVIDER_CONFIG_MISSING', '智能引擎配置缺失');
    }

    const idem = params.idempotencyKey
      ? `${params.tenantId}:${params.userId}:${params.workflowRef}:${params.idempotencyKey}`
      : null;

    if (idem && idempotencyMemory.has(idem)) {
      const existing = idempotencyMemory.get(idem)!;
      return { providerJobId: existing.providerJobId, status: 'queued' as const };
    }

    const endpoint = `${baseUrl.replace(/\/$/, '')}/v1/workflows/run`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          workflow_id: params.workflowRef,
          input: params.inputs,
          webhook_url: params.webhookUrl,
          idempotency_key: params.idempotencyKey,
          metadata: params.metadata,
        }),
      });
    } catch (err) {
      throw new ProviderExecutionError('PROVIDER_NETWORK_ERROR', '智能引擎调用失败', {
        reason: err instanceof Error ? err.message : 'unknown',
      });
    }

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      throw new ProviderExecutionError('PROVIDER_HTTP_ERROR', '智能引擎执行失败', {
        status: response.status,
        body: data,
      });
    }

    const providerJobId = String(data.task_id || data.job_id || data.id || `rh_${Date.now()}`);

    if (idem) {
      idempotencyMemory.set(idem, { providerJobId, createdAt: Date.now() });
    }

    this.logger.log(
      `executeWorkflow tenant=${params.tenantId} user=${params.userId} workflowRef=${params.workflowRef} providerJobId=${providerJobId}`,
    );

    return {
      providerJobId,
      status: (String(data.status || 'queued') as 'queued' | 'running' | 'succeeded' | 'failed'),
      outputs: (data.outputs as Record<string, unknown> | undefined) || undefined,
      raw: data,
    };
  }
}
