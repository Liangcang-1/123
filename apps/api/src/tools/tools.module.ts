import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolRunEntity } from '../database/entities';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [TypeOrmModule.forFeature([ToolRunEntity])],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
