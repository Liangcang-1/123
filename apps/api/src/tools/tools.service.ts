import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToolRunEntity } from '../database/entities';

@Injectable()
export class ToolsService {
  constructor(@InjectRepository(ToolRunEntity) private readonly toolRunsRepo: Repository<ToolRunEntity>) {}

  async runChat(userId: string, projectId: string | null, inputs: Record<string, unknown>) {
    const output = {
      title: `爆款标题：${String(inputs.product_name || '')}`,
      sellingPoints: ['高转化卖点1', '高转化卖点2'],
      adCopy: '这是一个用于MVP演示的投放文案。',
    };
    return this.toolRunsRepo.save(
      this.toolRunsRepo.create({ userId, projectId, inputs, outputs: output, tokens: 300, cost: 0.3 }),
    );
  }
}
