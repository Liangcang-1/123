import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLedgerEntity } from '../database/entities';
import { MembershipController } from './membership.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLedgerEntity])],
  controllers: [MembershipController],
})
export class MembershipModule {}
