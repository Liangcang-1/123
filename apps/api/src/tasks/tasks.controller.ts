import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { TasksService } from './tasks.service';

class RunDto {
  @IsString()
  workflow_key!: string;
}

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('generate/run')
  run(@Body() body: RunDto) {
    return this.tasksService.enqueue(body.workflow_key);
  }

  @Get('tasks')
  list() {
    return this.tasksService.list();
  }
}
