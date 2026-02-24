import { Body, Controller, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { TenantContext } from '../tenancy/tenant-context';
import { RequirePermissions } from '../tenancy/require-permissions.decorator';
import { AiExecutionService } from './ai-execution.service';

class ExecuteWorkflowDto {
  @IsString()
  workflowRef!: string;

  @IsObject()
  inputs!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

@Controller('ai')
export class AiExecutionController {
  constructor(private readonly aiExecutionService: AiExecutionService, private readonly tenantContext: TenantContext) {}

  @RequirePermissions('job.manage')
  @Post('execute')
  async execute(@Body() body: ExecuteWorkflowDto) {
    return {
      ok: true,
      data: await this.aiExecutionService.executeWorkflow({
        tenantId: this.tenantContext.tenantId || '',
        userId: this.tenantContext.userId || '',
        workflowRef: body.workflowRef,
        inputs: body.inputs,
        idempotencyKey: body.idempotencyKey,
      }),
    };
  }
}
