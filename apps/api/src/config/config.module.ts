import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderConfigEntity } from '../database/entities';
import { ConfigService } from './config.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderConfigEntity])],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
