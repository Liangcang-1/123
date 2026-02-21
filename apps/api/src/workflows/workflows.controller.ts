import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowWrapperEntity } from '../database/entities';

@Controller('workflows')
export class WorkflowsController {
  constructor(@InjectRepository(WorkflowWrapperEntity) private readonly workflowRepo: Repository<WorkflowWrapperEntity>) {}

  @Get()
  list() {
    return this.workflowRepo.find({ order: { workflowKey: 'ASC' } });
  }
}
