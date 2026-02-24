import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { AiExecutionService } from '../ai-providers/ai-execution.service';
import { AiProviderConfigService } from '../ai-providers/ai-provider.config';
import { ToolEntity, ToolMenuItemEntity } from '../../database/entities';

type FieldSchema = { key: string; type: string; required?: boolean; options?: string[] };

@Injectable()
export class ToolMarketplaceService {
  constructor(
    @InjectRepository(ToolEntity) private readonly toolRepo: Repository<ToolEntity>,
    @InjectRepository(ToolMenuItemEntity) private readonly menuRepo: Repository<ToolMenuItemEntity>,
    private readonly aiExecutionService: AiExecutionService,
    private readonly providerConfig: AiProviderConfigService,
  ) {}

  async listTools(tenantId: string, status?: string) {
    const where: any[] = [{ tenantId: IsNull() }, { tenantId }];
    const rows = await this.toolRepo.find({ where, order: { createdAt: 'DESC' } });
    const filtered = status ? rows.filter((x) => x.status === status) : rows;
    return { ok: true, data: filtered };
  }

  async createTool(tenantId: string, payload: Partial<ToolEntity>) {
    const existing = await this.toolRepo.findOne({ where: { tenantId, key: payload.key || '' } });
    if (existing) throw new BadRequestException({ code: 'TOOL_KEY_EXISTS', message: '工具 key 已存在' });

    const saved = await this.toolRepo.save(this.toolRepo.create({
      tenantId,
      key: payload.key,
      name: payload.name,
      description: payload.description || null,
      icon: payload.icon || null,
      providerKey: payload.providerKey || this.providerConfig.getDefaultProviderKey(),
      workflowRef: payload.workflowRef,
      inputSchema: payload.inputSchema || { title: payload.name, fields: [] },
      outputSchema: payload.outputSchema || null,
      status: payload.status || 'draft',
    }));

    return { ok: true, data: saved };
  }

  async updateTool(tenantId: string, id: string, payload: Partial<ToolEntity>) {
    const tool = await this.toolRepo.findOne({ where: { id } });
    if (!tool) throw new BadRequestException({ code: 'TOOL_NOT_FOUND', message: '工具不存在' });
    if (!tool.tenantId || tool.tenantId !== tenantId) throw new ForbiddenException({ code: 'FORBIDDEN', message: '仅可修改租户私有工具' });

    Object.assign(tool, {
      key: payload.key ?? tool.key,
      name: payload.name ?? tool.name,
      description: payload.description ?? tool.description,
      icon: payload.icon ?? tool.icon,
      providerKey: payload.providerKey ?? tool.providerKey,
      workflowRef: payload.workflowRef ?? tool.workflowRef,
      inputSchema: payload.inputSchema ?? tool.inputSchema,
      outputSchema: payload.outputSchema ?? tool.outputSchema,
      status: payload.status ?? tool.status,
    });

    return { ok: true, data: await this.toolRepo.save(tool) };
  }

  async archiveTool(tenantId: string, id: string) {
    const tool = await this.toolRepo.findOne({ where: { id } });
    if (!tool) throw new BadRequestException({ code: 'TOOL_NOT_FOUND', message: '工具不存在' });
    if (!tool.tenantId || tool.tenantId !== tenantId) throw new ForbiddenException({ code: 'FORBIDDEN', message: '仅可归档租户私有工具' });
    tool.status = 'archived';
    return { ok: true, data: await this.toolRepo.save(tool) };
  }

  async getOrInitMenu(tenantId: string) {
    let items = await this.menuRepo.find({ where: { tenantId }, order: { sortOrder: 'ASC' } });
    if (items.length === 0) {
      const tools = await this.toolRepo.find({ where: [{ tenantId: IsNull(), status: 'active' }, { tenantId, status: 'active' }], order: { createdAt: 'ASC' } });
      items = await this.menuRepo.save(tools.map((tool, idx) => this.menuRepo.create({ tenantId, toolId: tool.id, enabled: true, sortOrder: idx })));
    }

    const tools = await this.toolRepo.find({ where: { id: In(items.map((i) => i.toolId)) } });
    return {
      ok: true,
      data: items.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        toolId: item.toolId,
        nameOverride: item.nameOverride,
        sortOrder: item.sortOrder,
        enabled: item.enabled,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        tool: tools.find((t) => t.id === item.toolId) || null,
      })),
    };
  }

  async updateMenu(tenantId: string, data: Array<{ toolId: string; enabled: boolean; sortOrder: number; nameOverride?: string }>) {
    const toolIds = data.map((x) => x.toolId);
    const visible = await this.toolRepo.find({ where: [{ tenantId: IsNull(), id: In(toolIds) }, { tenantId, id: In(toolIds) }] });
    if (visible.length !== toolIds.length) {
      throw new ForbiddenException({ code: 'INVALID_TOOL_SCOPE', message: '包含不可见工具' });
    }

    await this.menuRepo.manager.transaction(async (trx) => {
      for (const item of data) {
        const old = await trx.findOne(ToolMenuItemEntity, { where: { tenantId, toolId: item.toolId } });
        const entity = trx.create(ToolMenuItemEntity, {
          id: old?.id,
          tenantId,
          toolId: item.toolId,
          enabled: item.enabled,
          sortOrder: item.sortOrder,
          nameOverride: item.nameOverride || null,
        });
        await trx.save(entity);
      }
    });

    return this.getOrInitMenu(tenantId);
  }

  async executeTool(tenantId: string, userId: string, id: string, inputs: Record<string, unknown>) {
    const tool = await this.toolRepo.findOne({ where: [{ id, tenantId }, { id, tenantId: IsNull() }] });
    if (!tool) throw new ForbiddenException({ code: 'FORBIDDEN', message: '工具不可见' });

    this.validateInputs(tool.inputSchema as Record<string, unknown>, inputs);

    const result = await this.aiExecutionService.executeWorkflow({
      tenantId,
      userId,
      workflowRef: tool.workflowRef,
      inputs,
      providerKeyOverride: tool.providerKey,
    });

    return { ok: true, data: result };
  }

  private validateInputs(schema: Record<string, unknown>, inputs: Record<string, unknown>) {
    const fields = (schema?.fields as FieldSchema[] | undefined) || [];
    for (const field of fields) {
      const val = inputs[field.key];
      if (field.required && (val === undefined || val === null || val === '')) {
        throw new BadRequestException({ code: 'INPUT_INVALID', message: `${field.key} 为必填项` });
      }
      if (val === undefined || val === null) continue;
      if (field.type === 'number' && typeof val !== 'number') {
        throw new BadRequestException({ code: 'INPUT_INVALID', message: `${field.key} 必须是数字` });
      }
      if (field.type === 'boolean' && typeof val !== 'boolean') {
        throw new BadRequestException({ code: 'INPUT_INVALID', message: `${field.key} 必须是布尔值` });
      }
      if (field.type === 'select' && field.options && !field.options.includes(String(val))) {
        throw new BadRequestException({ code: 'INPUT_INVALID', message: `${field.key} 取值非法` });
      }
    }
  }
}
