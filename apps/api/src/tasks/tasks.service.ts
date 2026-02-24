import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity, CatalogTemplateEntity, CatalogToolEntity, GenTaskEntity, TenantEntitlementEntity, UsageLedgerEntity } from '../database/entities';
import { ProviderAAdapter } from '../providers/provider-a.adapter';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(GenTaskEntity) private readonly taskRepo: Repository<GenTaskEntity>,
    @InjectRepository(TenantEntitlementEntity) private readonly entitlementRepo: Repository<TenantEntitlementEntity>,
    @InjectRepository(AssetEntity) private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(UsageLedgerEntity) private readonly usageRepo: Repository<UsageLedgerEntity>,
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
    private readonly providerAdapter: ProviderAAdapter,
  ) {}

  async runTask(userId: string, tenantId: string, type: 'template' | 'tool', id: string, input: Record<string, unknown>) {
    const entitled = await this.entitlementRepo.findOne({ where: { tenantId, itemType: type, itemId: id, enabled: true } });
    if (!entitled) {
      return { ok: false, error: { code: 'FORBIDDEN', message: '当前租户未开通该创作模板或工具' } };
    }

    const task = await this.taskRepo.save(this.taskRepo.create({
      tenantId,
      userId,
      type,
      templateId: type === 'template' ? id : null,
      toolId: type === 'tool' ? id : null,
      workflowKey: type,
      status: 'running',
      input,
      progress: 10,
    }));

    try {
      const result = await this.providerAdapter.runTask(input);
      task.status = 'succeeded';
      task.progress = 100;
      task.providerTaskId = result.providerTaskId;
      task.resultUrl = result.resultUrl;
      task.output = result.output;
      await this.taskRepo.save(task);

      await this.assetRepo.save(this.assetRepo.create({
        tenantId,
        taskId: task.id,
        type: result.assetType,
        contentUrl: result.resultUrl,
        meta: { from: type, itemId: id },
      }));

      await this.usageRepo.save(this.usageRepo.create({
        tenantId,
        userId,
        resourceType: 'generation',
        amount: 1,
        reason: `${type} run`,
        taskId: task.id,
      }));

      return { ok: true, data: task };
    } catch (e) {
      task.status = 'failed';
      task.errorCode = 'PROVIDER_EXECUTION_FAILED';
      task.errorMessage = '任务执行失败，请稍后重试';
      await this.taskRepo.save(task);
      return { ok: false, error: { code: 'PROVIDER_EXECUTION_FAILED', message: '任务执行失败，请稍后重试', traceId: task.id } };
    }
  }

  async list(tenantId: string, status?: string) {
    const where = status ? { tenantId, status } : { tenantId };
    return { ok: true, data: await this.taskRepo.find({ where, order: { createdAt: 'DESC' } }) };
  }

  async detail(tenantId: string, id: string) {
    return { ok: true, data: await this.taskRepo.findOne({ where: { tenantId, id } }) };
  }

  async retry(tenantId: string, id: string) {
    const task = await this.taskRepo.findOne({ where: { tenantId, id } });
    if (!task) return { ok: false, error: { code: 'NOT_FOUND', message: '任务不存在' } };
    return this.runTask(task.userId || '', tenantId, task.type, (task.templateId || task.toolId) as string, task.input || {});
  }

  async cancel(tenantId: string, id: string) {
    const task = await this.taskRepo.findOne({ where: { tenantId, id } });
    if (!task) return { ok: false, error: { code: 'NOT_FOUND', message: '任务不存在' } };
    task.status = 'canceled';
    await this.taskRepo.save(task);
    return { ok: true, data: task };
  }
}
