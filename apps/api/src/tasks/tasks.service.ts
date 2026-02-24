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

  private safeTask(task: GenTaskEntity) {
    return {
      id: task.id,
      tenantId: task.tenantId,
      userId: task.userId,
      type: task.type,
      templateId: task.templateId,
      toolId: task.toolId,
      status: task.status,
      input: task.input,
      output: task.output,
      progress: task.progress,
      resultUrl: task.resultUrl,
      errorCode: task.errorCode,
      errorMessage: task.errorMessage,
      providerTaskId: task.providerTaskId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  async runTask(userId: string, tenantId: string, type: 'template' | 'tool', id: string, input: Record<string, unknown>) {
    const entitled = await this.entitlementRepo.findOne({ where: { tenantId, itemType: type, itemId: id } });
    if (!entitled || !entitled.enabled) {
      return { ok: false, error: { code: 'NOT_ENTITLED', message: '当前套餐未开通该工具', hint: '升级套餐后可立即使用。' } };
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
        sourceTaskId: task.id,
        type: result.assetType,
        contentUrl: result.resultUrl,
        title: `${type} 输出结果`,
        tags: ['自动生成'],
        meta: { from: type, itemId: id },
      }));

      await this.usageRepo.save(this.usageRepo.create({
        tenantId,
        userId,
        resourceType: 'generation',
        amount: 1,
        reason: `${type}:${id}`,
        taskId: task.id,
      }));

      return { ok: true, data: this.safeTask(task) };
    } catch (e) {
      task.status = 'failed';
      task.errorCode = 'ENGINE_TIMEOUT';
      task.errorMessage = '计算引擎繁忙，请稍后重试';
      await this.taskRepo.save(task);
      return { ok: false, error: { code: 'ENGINE_TIMEOUT', message: '计算引擎繁忙，请稍后重试', traceId: task.id, hint: '可简化输入后重试。' } };
    }
  }

  async list(tenantId: string, status?: string) {
    const where = status ? { tenantId, status } : { tenantId };
    const rows = await this.taskRepo.find({ where, order: { createdAt: 'DESC' } });
    return { ok: true, data: rows.map((r) => this.safeTask(r)) };
  }

  async detail(tenantId: string, id: string) {
    const task = await this.taskRepo.findOne({ where: { tenantId, id } });
    return { ok: true, data: task ? this.safeTask(task) : null };
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
    return { ok: true, data: this.safeTask(task) };
  }
}
