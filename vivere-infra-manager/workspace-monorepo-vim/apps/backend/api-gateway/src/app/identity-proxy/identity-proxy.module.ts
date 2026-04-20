import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdentityProxyController } from './identity-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [IdentityProxyController],
})
export class IdentityProxyModule {}