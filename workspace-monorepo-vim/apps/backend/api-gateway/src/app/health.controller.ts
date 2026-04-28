/**
 * Controller para health check do gateway
 * Endpoint: GET /health
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica se o gateway está ativo' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        auth: process.env.AUTH_SERVICE_URL,
        identity: process.env.IDENTITY_SERVICE_URL,
        warehouse: process.env.WAREHOUSE_SERVICE_URL,
        serviceOrder: process.env.SERVICE_ORDER_SERVICE_URL,
        logistics: process.env.LOGISTICS_SERVICE_URL,
      },
    };
  }
}