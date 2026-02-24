import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolEntity, ToolMenuItemEntity } from '../../database/entities';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { ToolMarketplaceController } from './tool-marketplace.controller';
import { ToolMarketplaceService } from './tool-marketplace.service';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEntity, ToolMenuItemEntity]), AiProvidersModule],
  controllers: [ToolMarketplaceController],
  providers: [ToolMarketplaceService],
})
export class ToolMarketplaceModule {}
