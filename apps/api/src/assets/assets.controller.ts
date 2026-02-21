import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from '../database/entities';

@Controller('assets')
export class AssetsController {
  constructor(@InjectRepository(AssetEntity) private readonly assetRepo: Repository<AssetEntity>) {}

  @Get()
  list() {
    return this.assetRepo.find({ order: { createdAt: 'DESC' } });
  }
}
