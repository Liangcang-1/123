import { Module } from '@nestjs/common';
import { ProviderAAdapter } from './provider-a.adapter';

@Module({
  providers: [ProviderAAdapter],
  exports: [ProviderAAdapter],
})
export class ProvidersModule {}
