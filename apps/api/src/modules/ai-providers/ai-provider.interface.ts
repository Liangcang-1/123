export type ExecuteWorkflowParams = {
  tenantId: string;
  userId: string;
  workflowRef: string;
  inputs: Record<string, unknown>;
  webhookUrl?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

export type ExecuteWorkflowResult = {
  providerJobId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  outputs?: Record<string, unknown>;
  raw?: unknown;
};

export type JobStatusResult = {
  providerJobId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  outputs?: Record<string, unknown>;
};

export interface AiProvider {
  providerKey(): string;
  executeWorkflow(params: ExecuteWorkflowParams): Promise<ExecuteWorkflowResult>;
  getJobStatus?(params: { providerJobId: string }): Promise<JobStatusResult>;
  validateWebhook?(payload: unknown, signature?: string): Promise<boolean>;
}
