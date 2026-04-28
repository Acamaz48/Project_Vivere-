import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServiceOrderProxyController } from './service-order-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [ServiceOrderProxyController],
})
export class ServiceOrderProxyModule {}