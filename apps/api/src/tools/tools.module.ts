import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { CatalogTemplateEntity, CatalogToolEntity, MenuItemEntity, ToolRunEntity } from '../database/entities';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [TypeOrmModule.forFeature([ToolRunEntity, MenuItemEntity, CatalogTemplateEntity, CatalogToolEntity]), ConfigModule],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
