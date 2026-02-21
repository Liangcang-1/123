import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { ConfigModule } from '../config/config.module';
import { GenTaskEntity } from '../database/entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([GenTaskEntity]), ConfigModule, AdminModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
