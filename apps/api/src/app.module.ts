import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { BatchModule } from './batch/batch.module';
import { BillingModule } from './billing/billing.module';
import { CatalogModule } from './catalog/catalog.module';
import { ConfigModule } from './config/config.module';
import { ENTITIES } from './database/entities';
import { MembershipModule } from './membership/membership.module';
import { MenuModule } from './menu/menu.module';
import { ProjectsModule } from './projects/projects.module';
import { ProvidersModule } from './providers/providers.module';
import { SettingsModule } from './settings/settings.module';
import { SeedModule } from './seed/seed.module';
import { TasksModule } from './tasks/tasks.module';
import { ToolsModule } from './tools/tools.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'dev-secret' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'ecom_content',
      entities: ENTITIES,
      synchronize: false,
    }),
    ConfigModule,
    ProvidersModule,
    AuthModule,
    MembershipModule,
    ProjectsModule,
    ToolsModule,
    WorkflowsModule,
    TasksModule,
    AssetsModule,
    BatchModule,
    BillingModule,
    AdminModule,
    MenuModule,
    CatalogModule,
    SettingsModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
