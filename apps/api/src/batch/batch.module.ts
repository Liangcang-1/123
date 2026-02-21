import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchItemEntity, BatchJobEntity } from '../database/entities';
import { BatchController } from './batch.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BatchJobEntity, BatchItemEntity])],
  controllers: [BatchController],
})
export class BatchModule {}
