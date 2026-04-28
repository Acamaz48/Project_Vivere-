import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@logistics/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conectado ao banco de dados');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado ao banco de dados');
  }
}