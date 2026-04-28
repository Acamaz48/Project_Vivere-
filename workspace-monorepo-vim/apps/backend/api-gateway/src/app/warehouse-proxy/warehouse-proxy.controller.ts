/**
 * Controller proxy para o Warehouse Service
 * Endpoint: /warehouse/*
 */

import { Controller, All, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';
import { AxiosError } from 'axios';

@ApiTags('warehouse')
@Controller('warehouse')
export class WarehouseProxyController {
  private readonly logger = new Logger(WarehouseProxyController.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WAREHOUSE_SERVICE_URL') ?? '';
    if (!this.baseUrl) {
      throw new Error('WAREHOUSE_SERVICE_URL não definida');
    }
  }

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const method = req.method;
    const originalUrl = req.originalUrl ?? '';
    const url = `${this.baseUrl}${originalUrl.replace('/api/warehouse', '')}`;
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    this.logger.log(`[WAREHOUSE] ${method} ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data: req.body,
          headers,
          params: req.query,
        }),
      );
      res.status(response.status).send(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Erro no proxy para ${url}: ${error.message}`);
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro ao comunicar com o Warehouse Service',
          });
        }
      } else {
        const err = error as Error;
        this.logger.error(`Erro desconhecido no proxy para ${url}: ${err.message}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro interno no gateway',
        });
      }
    }
  }
}