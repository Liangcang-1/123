import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogTemplateEntity, CatalogToolEntity } from '../database/entities';

@Controller('catalog')
export class CatalogController {
  constructor(
    @InjectRepository(CatalogTemplateEntity) private readonly templateRepo: Repository<CatalogTemplateEntity>,
    @InjectRepository(CatalogToolEntity) private readonly toolRepo: Repository<CatalogToolEntity>,
  ) {}

  @Get('templates')
  async templates(@Query('category') category?: string) {
    const where = category ? { enabled: true, category } : { enabled: true };
    return { ok: true, data: await this.templateRepo.find({ where, order: { createdAt: 'DESC' } }) };
  }

  @Get('tools')
  async tools(@Query('category') category?: string) {
    const where = category ? { enabled: true, category } : { enabled: true };
    return { ok: true, data: await this.toolRepo.find({ where, order: { createdAt: 'DESC' } }) };
  }
}
