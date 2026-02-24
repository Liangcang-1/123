import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../database/entities';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [SettingsController],
})
export class SettingsModule {}
