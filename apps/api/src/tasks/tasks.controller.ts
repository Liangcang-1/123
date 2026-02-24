import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { TasksService } from './tasks.service';
import { getAuthUser } from '../common/auth.util';

class RunTaskDto {
  @IsIn(['template', 'tool'])
  type!: 'template' | 'tool';

  @IsString()
  id!: string;

  @IsObject()
  input!: Record<string, unknown>;
}

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly jwtService: JwtService) {}

  @Post('run')
  async run(@Headers('authorization') authHeader: string | undefined, @Body() body: RunTaskDto) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return this.tasksService.runTask(user.sub, user.tenantId || '', body.type, body.id, body.input);
  }

  @Get()
  async list(@Headers('authorization') authHeader: string | undefined, @Query('status') @IsOptional() status?: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return this.tasksService.list(user.tenantId || '', status);
  }

  @Get(':id')
  async detail(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return this.tasksService.detail(user.tenantId || '', id);
  }

  @Post(':id/retry')
  async retry(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return this.tasksService.retry(user.tenantId || '', id);
  }

  @Post(':id/cancel')
  async cancel(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return this.tasksService.cancel(user.tenantId || '', id);
  }
}
