import { Body, Controller, Get, Headers, Put } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsOptional, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { TenantEntity } from '../database/entities';
import { getAuthUser } from '../common/auth.util';

class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly jwtService: JwtService, @InjectRepository(TenantEntity) private readonly tenantRepo: Repository<TenantEntity>) {}

  @Get()
  async get(@Headers('authorization') authHeader?: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return { ok: true, data: await this.tenantRepo.findOne({ where: { id: user.tenantId } }) };
  }

  @Put()
  async put(@Headers('authorization') authHeader: string | undefined, @Body() body: UpdateTenantDto) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const tenant = await this.tenantRepo.findOne({ where: { id: user.tenantId } });
    if (!tenant) return { ok: false, error: { code: 'TENANT_NOT_FOUND', message: '租户不存在' } };
    tenant.name = body.name ?? tenant.name;
    await this.tenantRepo.save(tenant);
    return { ok: true, data: tenant };
  }
}
