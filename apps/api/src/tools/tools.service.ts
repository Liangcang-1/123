import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { OpenAIChatConfig } from '../config/config.types';
import { ToolRunEntity } from '../database/entities';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(ToolRunEntity) private readonly toolRunsRepo: Repository<ToolRunEntity>,
    private readonly configService: ConfigService,
  ) {}

  async runChat(userId: string, projectId: string | null, inputs: Record<string, unknown>) {
    const config = (await this.configService.getActiveConfig('openai_chat')) as OpenAIChatConfig | null;
    if (!config) {
      throw new ServiceUnavailableException('openai_chat provider config not found');
    }

    const output = {
      title: `爆款标题：${String(inputs.product_name || '')}`,
      sellingPoints: ['高转化卖点1', '高转化卖点2'],
      adCopy: '这是一个用于MVP演示的投放文案。',
      model: config.model,
      temperature: config.temperature,
      timeout: config.timeout,
      retry: config.retry,
    };

    return this.toolRunsRepo.save(
      this.toolRunsRepo.create({ userId, projectId, inputs, outputs: output, tokens: 300, cost: 0.3 }),
    );
  }
}
