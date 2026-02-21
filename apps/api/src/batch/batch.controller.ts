import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchItemEntity, BatchJobEntity } from '../database/entities';

@Controller('batch')
export class BatchController {
  constructor(
    @InjectRepository(BatchJobEntity) private readonly batchJobRepo: Repository<BatchJobEntity>,
    @InjectRepository(BatchItemEntity) private readonly batchItemRepo: Repository<BatchItemEntity>,
  ) {}

  @Post('upload')
  async upload(@Body() body: { userId: string; items: Record<string, unknown>[] }) {
    const job = await this.batchJobRepo.save(this.batchJobRepo.create({ userId: body.userId, status: 'uploaded' }));
    await this.batchItemRepo.save(
      (body.items || []).map((payload) => this.batchItemRepo.create({ batchJobId: job.id, payload, status: 'pending' })),
    );
    return job;
  }

  @Post('run')
  async run(@Body() body: { batchJobId: string }) {
    await this.batchJobRepo.update({ id: body.batchJobId }, { status: 'running' });
    return this.batchJobRepo.findOne({ where: { id: body.batchJobId } });
  }
}
