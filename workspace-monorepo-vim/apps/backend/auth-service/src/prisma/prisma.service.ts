import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@auth/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 1. Criamos a conexão explícita com o Postgres (Usando a URL física para testar)
    const connectionString = "postgresql://postgres:1234@localhost:5432/auth_db?schema=public";
    const pool = new Pool({ connectionString });
    
    // 2. Instanciamos o adaptador do Prisma
    const adapter = new PrismaPg(pool);

    // 3. Passamos o adaptador para o cliente (Isso acaba com o erro do PrismaClientOptions!)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conectado ao banco de dados com sucesso!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconectado do banco de dados');
  }
}