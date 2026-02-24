import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity, TenantEntity } from '../database/entities';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity, TenantEntity])],
  controllers: [MenuController],
})
export class MenuModule {}
