import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity, CatalogTemplateEntity, CatalogToolEntity, GenTaskEntity, TenantEntitlementEntity, UsageLedgerEntity } from '../database/entities';
import { AiProvidersModule } from '../modules/ai-providers/ai-providers.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GenTaskEntity, TenantEntitlementEntity, AssetEntity, UsageLedgerEntity, CatalogTemplateEntity, CatalogToolEntity]),
    AiProvidersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
