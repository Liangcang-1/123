import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLedgerEntity } from '../database/entities';

@Controller('usage')
export class MembershipController {
  constructor(@InjectRepository(UsageLedgerEntity) private readonly usageRepo: Repository<UsageLedgerEntity>) {}

  @Get()
  usage(@Query('userId') userId?: string) {
    if (!userId) return [];
    return this.usageRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
