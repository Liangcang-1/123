import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogTemplateEntity, CatalogToolEntity, MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity, TenantEntity, UserEntity } from '../database/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity, CatalogTemplateEntity, CatalogToolEntity, MenuGroupEntity, MenuItemEntity, TenantEntitlementEntity])],
  providers: [SeedService],
})
export class SeedModule {}
