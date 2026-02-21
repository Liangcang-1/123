import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLogEntity, ProviderConfigEntity, ProviderConfigVersionEntity, SecretVaultEntity } from '../database/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderConfigEntity, ProviderConfigVersionEntity, SecretVaultEntity, AdminLogEntity])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
