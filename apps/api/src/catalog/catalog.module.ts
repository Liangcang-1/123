import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogTemplateEntity, CatalogToolEntity } from '../database/entities';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CatalogTemplateEntity, CatalogToolEntity])],
  controllers: [CatalogController],
})
export class CatalogModule {}
