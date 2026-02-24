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

  async executeWorkflow(params: ExecuteWorkflowParams) {
    const provider = this.registry.get(this.providerConfig.getDefaultProviderKey());
    const result = await provider.executeWorkflow(params);
    return {
      providerJobId: result.providerJobId,
      status: result.status,
      outputs: result.outputs,
    };
  }
}
