import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowWrapperEntity } from '../database/entities';
import { WorkflowsController } from './workflows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowWrapperEntity])],
  controllers: [WorkflowsController],
})
export class WorkflowsModule {}
