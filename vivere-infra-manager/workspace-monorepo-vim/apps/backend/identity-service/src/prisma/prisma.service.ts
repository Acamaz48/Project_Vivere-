import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@identity/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 1. Pega a URL do ambiente (igual no seu prisma.config.ts)
    const connectionString = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

    // 2. Cria o pool de conexão nativo do Node Postgres
    const pool = new Pool({ connectionString });

    // 3. Cria o Adapter do Prisma
    const adapter = new PrismaPg(pool);

    // 4. Injeta o adapter no Prisma (Exigência do Prisma 7)
    super({ adapter } as any);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conectado ao banco de dados Identity (via Prisma Adapter)');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar no banco de dados', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Desconectado do banco de dados');
  }
}