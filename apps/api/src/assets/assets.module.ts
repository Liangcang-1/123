import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from '../database/entities';
import { AssetsController } from './assets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity])],
  controllers: [AssetsController],
})
export class AssetsModule {}
