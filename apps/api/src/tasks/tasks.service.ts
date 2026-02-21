import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { AdminService } from '../admin/admin.service';
import { ConfigService } from '../config/config.service';
import { RunninghubConfig } from '../config/config.types';
import { GenTaskEntity } from '../database/entities';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(GenTaskEntity) private readonly taskRepo: Repository<GenTaskEntity>,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {}

  async enqueue(workflowKey: string) {
    const config = (await this.configService.getActiveConfig('runninghub')) as RunninghubConfig | null;
    if (!config) {
      throw new ServiceUnavailableException('runninghub provider config not found');
    }

    const currentQueued = await this.taskRepo.count({ where: { status: 'queued' } });
    if (currentQueued >= config.queue_limit) {
      throw new ServiceUnavailableException('runninghub queue limit reached');
    }

    const secretRef = config.api_key_secret_ref;
    const apiKey = secretRef ? await this.adminService.getSecretValue(secretRef) : null;

    const task = await this.taskRepo.save(
      this.taskRepo.create({
        workflowKey,
        status: 'queued',
        progress: 0,
        runninghubTaskId: null,
        resultUrl: null,
      }),
    );

    if (process.env.REDIS_URL) {
      const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      const queue = new Queue('runninghub-tasks', { connection });
      await queue.add('run-workflow', {
        taskId: task.id,
        workflowKey,
        endpoint: config.endpoint,
        timeout: config.timeout,
        hasApiKey: Boolean(apiKey),
      });
      await queue.close();
      await connection.quit();
    }

    return task;
  }

  list() {
    return this.taskRepo.find({ order: { createdAt: 'DESC' } });
  }
}
