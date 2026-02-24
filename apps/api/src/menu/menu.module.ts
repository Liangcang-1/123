import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogTemplateEntity, CatalogToolEntity, MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity } from '../database/entities';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity, CatalogTemplateEntity, CatalogToolEntity])],
  controllers: [MenuController],
})
export class MenuModule {}
