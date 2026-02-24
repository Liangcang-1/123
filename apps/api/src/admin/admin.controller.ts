import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ProviderKey } from '../config/config.types';
import { AdminService } from './admin.service';

class ProviderConfigDto {
  @IsString() providerKey!: ProviderKey;
  @IsObject() configJson!: Record<string, unknown>;
  @IsString() changeNote!: string;
  @IsString() adminId!: string;
}
class RollbackDto {
  @IsString() providerKey!: ProviderKey;
  @IsInt() @Min(1) version!: number;
  @IsString() adminId!: string;
  @IsOptional() @IsString() changeNote?: string;
}
class SecretDto { @IsString() secretKey!: string; @IsString() value!: string; @IsString() adminId!: string; }

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('provider-configs') listProviderConfigs() { return this.adminService.listProviderConfigs(); }
  @Post('provider-configs') saveProviderConfig(@Body() body: ProviderConfigDto) { return this.adminService.saveProviderConfig(body); }
  @Post('provider-configs/version') createConfigVersion(@Body() body: ProviderConfigDto) { return this.adminService.saveProviderConfig(body); }
  @Post('provider-configs/rollback') rollback(@Body() body: RollbackDto) { return this.adminService.rollbackProviderConfig(body.providerKey, body.version, body.adminId, body.changeNote || 'manual rollback'); }

  @Post('catalog/sync') syncCatalog(@Body() body: { adminId: string }) { return this.adminService.syncCatalog(body.adminId); }
  @Get('menu/groups') groups() { return this.adminService.menuGroups(); }
  @Post('menu/groups') saveGroup(@Body() body: any) { return this.adminService.saveMenuGroup(body); }
  @Get('menu/items') items(@Query('groupId') groupId?: string) { return this.adminService.menuItems(groupId); }
  @Post('menu/items') saveItem(@Body() body: any) { return this.adminService.saveMenuItem(body); }
  @Get('tenants/:id/entitlements') entitlements(@Param('id') id: string) { return this.adminService.listEntitlements(id); }
  @Post('tenants/:id/entitlements') saveEntitlements(@Param('id') id: string, @Body() body: any) { return this.adminService.saveEntitlement({ ...body, tenantId: id }); }

  @Post('secrets') saveSecret(@Body() body: SecretDto) { return this.adminService.upsertSecret(body.secretKey, body.value, body.adminId); }
  @Patch('secrets/rotate') rotateSecret(@Body() body: SecretDto) { return this.adminService.rotateSecret(body.secretKey, body.value, body.adminId); }
  @Get('audit-logs') logs() { return this.adminService.getAuditLogs(); }
}
