import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity, AssetFolderEntity } from '../database/entities';
import { AssetsController } from './assets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, AssetFolderEntity])],
  controllers: [AssetsController],
})
export class AssetsModule {}
