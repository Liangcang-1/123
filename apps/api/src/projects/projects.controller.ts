import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  @IsIn(['store', 'campaign'])
  type!: 'store' | 'campaign';

  @IsString()
  name!: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService, private readonly jwtService: JwtService) {}

  private async getUserId(authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, { secret: process.env.JWT_SECRET || 'dev-secret' });
    return payload.sub;
  }

  @Post()
  async create(@Headers('authorization') authHeader: string | undefined, @Body() body: CreateProjectDto) {
    return this.projectsService.create(await this.getUserId(authHeader), body);
  }

  @Get()
  async list(@Headers('authorization') authHeader: string | undefined) {
    return this.projectsService.list(await this.getUserId(authHeader));
  }
}
