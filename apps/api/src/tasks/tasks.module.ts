import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenTaskEntity } from '../database/entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([GenTaskEntity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
