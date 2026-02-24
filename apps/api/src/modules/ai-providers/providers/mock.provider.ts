import { Injectable } from '@nestjs/common';
import { AiProvider, ExecuteWorkflowParams } from '../ai-provider.interface';

@Injectable()
export class MockProvider implements AiProvider {
  providerKey() {
    return 'mock';
  }

  async executeWorkflow(params: ExecuteWorkflowParams) {
    return {
      providerJobId: `mock_${params.tenantId}_${Date.now()}`,
      status: 'succeeded' as const,
      outputs: {
        workflowRef: params.workflowRef,
        echoed: params.inputs,
        message: 'mock provider execution succeeded',
      },
      raw: { provider: 'mock', ts: Date.now() },
    };
  }
}
