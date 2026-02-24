import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { OpenAIChatConfig } from '../config/config.types';
import { CatalogTemplateEntity, CatalogToolEntity, MenuItemEntity, ToolRunEntity } from '../database/entities';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(ToolRunEntity) private readonly toolRunsRepo: Repository<ToolRunEntity>,
    @InjectRepository(MenuItemEntity) private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
    private readonly configService: ConfigService,
  ) {}

  async runChat(userId: string, projectId: string | null, inputs: Record<string, unknown>) {
    const config = (await this.configService.getActiveConfig('openai_chat')) as OpenAIChatConfig | null;
    if (!config) {
      throw new ServiceUnavailableException({ code: 'ENGINE_TIMEOUT', message: '智能引擎暂不可用' });
    }

    const output = {
      title: `爆款标题：${String(inputs.product_name || '')}`,
      sellingPoints: ['高转化卖点1', '高转化卖点2'],
      adCopy: '这是一个用于MVP演示的投放文案。',
      model: config.model,
    };

    const saved = await this.toolRunsRepo.save(
      this.toolRunsRepo.create({ userId, projectId, inputs, outputs: output, tokens: 300, cost: 0.3 }),
    );
    return { ok: true, data: saved };
  }

  async getMeta(menuItemId: string) {
    const menu = await this.menuItemRepo.findOne({ where: { id: menuItemId } });
    if (!menu) return { ok: false, error: { code: 'NOT_FOUND', message: '工具不存在' } };
    if (menu.itemType === 'template' && menu.itemId) {
      const item = await this.templateRepo.findOne({ where: { id: menu.itemId } });
      return {
        ok: true,
        data: {
          id: menu.id,
          title: menu.title,
          description: item?.description,
          scenes: item?.scenes,
          examples: item?.examples,
          presets: item?.presets,
          schema: item?.inputSchema,
          costHint: item?.costHint || menu.costHint,
        },
      };
    }
    if (menu.itemType === 'tool' && menu.itemId) {
      const item = await this.toolRepo.findOne({ where: { id: menu.itemId } });
      return {
        ok: true,
        data: {
          id: menu.id,
          title: menu.title,
          description: item?.description,
          scenes: item?.scenes,
          examples: item?.examples,
          presets: item?.presets,
          schema: item?.inputSchema,
          costHint: item?.costHint || menu.costHint,
        },
      };
    }
    return { ok: true, data: { id: menu.id, title: menu.title, schema: { fields: [] } } };
  }
}
