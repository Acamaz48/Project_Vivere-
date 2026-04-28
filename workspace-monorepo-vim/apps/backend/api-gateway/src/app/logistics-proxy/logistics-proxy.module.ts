import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LogisticsProxyController } from './logistics-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [LogisticsProxyController],
})
export class LogisticsProxyModule {}