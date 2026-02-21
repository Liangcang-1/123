import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ProviderKey } from '../config/config.types';
import { AdminService } from './admin.service';

class ProviderConfigDto {
  @IsString()
  providerKey!: ProviderKey;

  @IsObject()
  configJson!: Record<string, unknown>;

  @IsString()
  changeNote!: string;

  @IsString()
  adminId!: string;
}

class RollbackDto {
  @IsString()
  providerKey!: ProviderKey;

  @IsInt()
  @Min(1)
  version!: number;

  @IsString()
  adminId!: string;

  @IsOptional()
  @IsString()
  changeNote?: string;
}

class SecretDto {
  @IsString()
  secretKey!: string;

  @IsString()
  value!: string;

  @IsString()
  adminId!: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  health() {
    return {
      modules: ['users', 'plans', 'chat-tools', 'runninghub-wrappers', 'tasks', 'batch', 'audit-log', 'provider-config'],
      versionedJsonConfig: true,
    };
  }

  @Get('provider-configs')
  listProviderConfigs() {
    return this.adminService.listProviderConfigs();
  }

  @Post('provider-configs')
  saveProviderConfig(@Body() body: ProviderConfigDto) {
    return this.adminService.saveProviderConfig(body);
  }

  @Post('provider-configs/version')
  createVersion(@Body() body: ProviderConfigDto) {
    return this.adminService.createConfigVersion(body);
  }

  @Post('provider-configs/rollback')
  rollback(@Body() body: RollbackDto) {
    return this.adminService.rollbackProviderConfig(body.providerKey, body.version, body.adminId, body.changeNote || '');
  }

  @Post('secrets')
  saveSecret(@Body() body: SecretDto) {
    return this.adminService.upsertSecret(body.secretKey, body.value, body.adminId);
  }

  @Patch('secrets/rotate')
  rotateSecret(@Body() body: SecretDto) {
    return this.adminService.rotateSecret(body.secretKey, body.value, body.adminId);
  }

  @Get('logs')
  logs() {
    return this.adminService.getAuditLogs();
  }
}
