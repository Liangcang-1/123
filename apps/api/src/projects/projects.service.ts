import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../database/entities';

@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(ProjectEntity) private readonly projectRepo: Repository<ProjectEntity>) {}

  create(userId: string, payload: Pick<ProjectEntity, 'name' | 'type'>) {
    return this.projectRepo.save(this.projectRepo.create({ ...payload, userId }));
  }

  list(userId: string) {
    return this.projectRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
