import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AiExecutionController } from './ai-execution.controller';
import { AiExecutionService } from './ai-execution.service';
import { AiProviderConfigService } from './ai-provider.config';
import { ProviderRegistry } from './provider.registry';
import { MockProvider } from './providers/mock.provider';
import { ProviderAProvider } from './providers/provider-a.provider';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [NestConfigModule, TenancyModule],
  controllers: [AiExecutionController],
  providers: [AiProviderConfigService, ProviderRegistry, MockProvider, ProviderAProvider, AiExecutionService],
  exports: [AiExecutionService],
})
export class AiProvidersModule {}
