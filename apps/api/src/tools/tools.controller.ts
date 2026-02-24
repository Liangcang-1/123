import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ToolsService } from './tools.service';

class RunChatDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsObject()
  inputs!: Record<string, unknown>;
}

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService, private readonly jwtService: JwtService) {}

  @Post('chat/run')
  async run(@Headers('authorization') authHeader: string | undefined, @Body() body: RunChatDto) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, { secret: process.env.JWT_SECRET || 'dev-secret' });
    return this.toolsService.runChat(payload.sub, body.projectId || null, body.inputs);
  }

  @Get(':menuItemId/meta')
  meta(@Param('menuItemId') menuItemId: string) {
    return this.toolsService.getMeta(menuItemId);
  }
}
