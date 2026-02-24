import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity, UsageLedgerEntity } from '../database/entities';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLedgerEntity, TenantEntity])],
  controllers: [BillingController],
})
export class BillingModule {}
