import { Injectable } from '@nestjs/common';
import { AiProviderConfigService } from './ai-provider.config';
import { ExecuteWorkflowParams } from './ai-provider.interface';
import { ProviderRegistry } from './provider.registry';
import { MockProvider } from './providers/mock.provider';
import { ProviderAProvider } from './providers/provider-a.provider';

@Injectable()
export class AiExecutionService {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly providerConfig: AiProviderConfigService,
    mockProvider: MockProvider,
    runningHubProvider: ProviderAProvider,
  ) {
    this.registry.register(mockProvider);
    this.registry.register(runningHubProvider);
  }

  async executeWorkflow(params: ExecuteWorkflowParams & { providerKeyOverride?: string }) {
    const providerKey = params.providerKeyOverride || this.providerConfig.getDefaultProviderKey();
    const provider = this.registry.get(providerKey);
    const { providerKeyOverride: _providerKeyOverride, ...executeParams } = params;
    const result = await provider.executeWorkflow(executeParams);
    return {
      providerJobId: result.providerJobId,
      status: result.status,
      outputs: result.outputs,
    };
  }
}
