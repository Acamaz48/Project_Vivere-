/**
 * Módulo principal do API Gateway
 * Importa os módulos de proxy para cada microsserviço
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';
import { IdentityProxyModule } from './identity-proxy/identity-proxy.module';
import { WarehouseProxyModule } from './warehouse-proxy/warehouse-proxy.module';
import { ServiceOrderProxyModule } from './service-order-proxy/service-order-proxy.module';
import { LogisticsProxyModule } from './logistics-proxy/logistics-proxy.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Carrega variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Módulo HTTP para fazer requisições aos microsserviços
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    // Módulos de proxy
    AuthProxyModule,
    IdentityProxyModule,
    WarehouseProxyModule,
    ServiceOrderProxyModule,
    LogisticsProxyModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}