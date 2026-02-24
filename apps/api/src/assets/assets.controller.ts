import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from '../database/entities';
import { getAuthUser } from '../common/auth.util';

@Controller('assets')
export class AssetsController {
  constructor(private readonly jwtService: JwtService, @InjectRepository(AssetEntity) private readonly assetRepo: Repository<AssetEntity>) {}

  @Get()
  async list(@Headers('authorization') authHeader: string | undefined, @Query('type') type?: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const where = type ? { tenantId: user.tenantId, type } : { tenantId: user.tenantId };
    return { ok: true, data: await this.assetRepo.find({ where, order: { createdAt: 'DESC' } }) };
  }

  @Get(':id')
  async detail(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return { ok: true, data: await this.assetRepo.findOne({ where: { id, tenantId: user.tenantId } }) };
  }
}
