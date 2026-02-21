import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { GenTaskEntity } from '../database/entities';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(GenTaskEntity) private readonly taskRepo: Repository<GenTaskEntity>) {}

  async enqueue(workflowKey: string) {
    const task = await this.taskRepo.save(this.taskRepo.create({ workflowKey, status: 'queued', progress: 0 }));
    if (process.env.REDIS_URL) {
      const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      const queue = new Queue('runninghub-tasks', { connection });
      await queue.add('run-workflow', { taskId: task.id, workflowKey });
      await queue.close();
      await connection.quit();
    }
    return task;
  }

  list() {
    return this.taskRepo.find({ order: { createdAt: 'DESC' } });
  }
}
