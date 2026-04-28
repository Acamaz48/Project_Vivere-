import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WarehouseProxyController } from './warehouse-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [WarehouseProxyController],
})
export class WarehouseProxyModule {}