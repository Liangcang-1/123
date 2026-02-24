import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ILike, Repository } from 'typeorm';
import { AssetEntity, AssetFolderEntity } from '../database/entities';
import { getAuthUser } from '../common/auth.util';

class CreateFolderDto {
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  parentId?: string;
}

class UpdateAssetDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() folderId?: string;
  @IsOptional() @IsArray() tags?: string[];
}

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(AssetEntity) private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetFolderEntity) private readonly folderRepo: Repository<AssetFolderEntity>,
  ) {}

  @Get('folders')
  async folders(@Headers('authorization') authHeader: string | undefined) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return { ok: true, data: await this.folderRepo.find({ where: { tenantId: user.tenantId }, order: { createdAt: 'DESC' } }) };
  }

  @Post('folders')
  async createFolder(@Headers('authorization') authHeader: string | undefined, @Body() body: CreateFolderDto) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const folder = await this.folderRepo.save(this.folderRepo.create({ tenantId: user.tenantId || '', name: body.name, parentId: body.parentId || null }));
    return { ok: true, data: folder };
  }

  @Get()
  async list(
    @Headers('authorization') authHeader: string | undefined,
    @Query('type') type?: string,
    @Query('q') q?: string,
    @Query('folder') folderId?: string,
    @Query('tag') tag?: string,
    @Query('page') page = '1',
  ) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const where: any = { tenantId: user.tenantId, deletedAt: null };
    if (type) where.type = type;
    if (folderId) where.folderId = folderId;
    if (q) where.title = ILike(`%${q}%`);
    if (tag) where.tags = [tag];
    const take = 20;
    const skip = (Number(page) - 1) * take;
    return { ok: true, data: await this.assetRepo.find({ where, order: { createdAt: 'DESC' }, take, skip }) };
  }

  @Get(':id')
  async detail(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    return { ok: true, data: await this.assetRepo.findOne({ where: { id, tenantId: user.tenantId } }) };
  }

  @Patch(':id')
  async update(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string, @Body() body: UpdateAssetDto) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const asset = await this.assetRepo.findOne({ where: { id, tenantId: user.tenantId } });
    if (!asset) return { ok: false, error: { code: 'NOT_FOUND', message: '素材不存在' } };
    asset.title = body.title ?? asset.title;
    asset.folderId = body.folderId ?? asset.folderId;
    asset.tags = body.tags ?? asset.tags;
    await this.assetRepo.save(asset);
    return { ok: true, data: asset };
  }

  @Delete(':id')
  async remove(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const user = await getAuthUser(this.jwtService, authHeader);
    const asset = await this.assetRepo.findOne({ where: { id, tenantId: user.tenantId } });
    if (!asset) return { ok: false, error: { code: 'NOT_FOUND', message: '素材不存在' } };
    asset.deletedAt = new Date();
    await this.assetRepo.save(asset);
    return { ok: true, data: { id: asset.id } };
  }
}
