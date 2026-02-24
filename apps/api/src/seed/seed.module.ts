import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AssetEntity,
  AssetFolderEntity,
  CatalogTemplateEntity,
  CatalogToolEntity,
  GenTaskEntity,
  MenuGroupEntity,
  MenuItemEntity,
  TenantEntitlementEntity,
  TenantEntity,
  TenantUserEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  ToolEntity,
  ToolMenuItemEntity,
  UsageLedgerEntity,
  UserEntity,
} from '../database/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      UserEntity,
      CatalogTemplateEntity,
      CatalogToolEntity,
      MenuGroupEntity,
      MenuItemEntity,
      TenantEntitlementEntity,
      GenTaskEntity,
      AssetEntity,
      AssetFolderEntity,
      UsageLedgerEntity,
      TenantUserEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      ToolEntity,
      ToolMenuItemEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
