import { Controller, Get } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get('health')
  health() {
    return {
      modules: ['users', 'plans', 'chat-tools', 'runninghub-wrappers', 'tasks', 'batch', 'audit-log'],
      versionedJsonConfig: true,
    };
  }
}
