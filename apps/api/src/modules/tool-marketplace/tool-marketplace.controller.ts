import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IsArray, IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { RequirePermissions } from '../tenancy/require-permissions.decorator';
import { TenantContext } from '../tenancy/tenant-context';
import { ToolMarketplaceService } from './tool-marketplace.service';

class CreateToolDto {
  @IsString() key!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() providerKey?: string;
  @IsString() workflowRef!: string;
  @IsObject() inputSchema!: Record<string, unknown>;
  @IsOptional() @IsObject() outputSchema?: Record<string, unknown>;
  @IsOptional() @IsIn(['draft', 'active', 'archived']) status?: 'draft' | 'active' | 'archived';
}

class MenuItemDto {
  @IsString() toolId!: string;
  @IsBoolean() enabled!: boolean;
  @IsInt() @Min(0) sortOrder!: number;
  @IsOptional() @IsString() nameOverride?: string;
}

class UpdateMenuDto {
  @IsArray()
  items!: MenuItemDto[];
}

@Controller()
export class ToolMarketplaceController {
  constructor(private readonly service: ToolMarketplaceService, private readonly tenantContext: TenantContext) {}

  @RequirePermissions('tool.read')
  @Get('tools')
  listTools(@Query('status') status?: string) {
    return this.service.listTools(this.tenantContext.tenantId || '', status);
  }

  @RequirePermissions('tool.manage')
  @Post('tools')
  createTool(@Body() body: CreateToolDto) {
    return this.service.createTool(this.tenantContext.tenantId || '', body);
  }

  @RequirePermissions('tool.manage')
  @Put('tools/:id')
  updateTool(@Param('id') id: string, @Body() body: Partial<CreateToolDto>) {
    return this.service.updateTool(this.tenantContext.tenantId || '', id, body);
  }

  @RequirePermissions('tool.manage')
  @Delete('tools/:id')
  deleteTool(@Param('id') id: string) {
    return this.service.archiveTool(this.tenantContext.tenantId || '', id);
  }

  @RequirePermissions('tool.read')
  @Get('tool-menu')
  getMenu() {
    return this.service.getOrInitMenu(this.tenantContext.tenantId || '');
  }

  @RequirePermissions('tool.manage')
  @Put('tool-menu')
  putMenu(@Body() body: UpdateMenuDto) {
    return this.service.updateMenu(this.tenantContext.tenantId || '', body.items);
  }

  @RequirePermissions('tool.read')
  @Post('tools/:id/execute')
  execute(@Param('id') id: string, @Body() body: { inputs: Record<string, unknown> }) {
    return this.service.executeTool(
      this.tenantContext.tenantId || '',
      this.tenantContext.userId || '',
      id,
      body.inputs || {},
    );
  }
}
