import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminLogEntity,
  CatalogTemplateEntity,
  CatalogToolEntity,
  MenuGroupEntity,
  MenuItemEntity,
  ProviderConfigEntity,
  ProviderConfigVersionEntity,
  SecretVaultEntity,
  TenantEntitlementEntity,
} from '../database/entities';
import { ProvidersModule } from '../providers/providers.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderConfigEntity,
      ProviderConfigVersionEntity,
      SecretVaultEntity,
      AdminLogEntity,
      CatalogTemplateEntity,
      CatalogToolEntity,
      MenuGroupEntity,
      MenuItemEntity,
      TenantEntitlementEntity,
    ]),
    ProvidersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
