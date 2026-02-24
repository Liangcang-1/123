import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity, RoleEntity, RolePermissionEntity, TenantUserEntity } from '../../database/entities';
import { RequirePermissionsGuard } from './require-permissions.guard';
import { TenancyGuard } from './tenancy.guard';
import { TenantContext } from './tenant-context';

@Module({
  imports: [TypeOrmModule.forFeature([TenantUserEntity, RoleEntity, RolePermissionEntity, PermissionEntity])],
  providers: [TenantContext, TenancyGuard, RequirePermissionsGuard],
  exports: [TenantContext, TenancyGuard, RequirePermissionsGuard],
})
export class TenancyModule {}
