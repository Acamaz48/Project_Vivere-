import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { BomRepository } from './repository/bom.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { ItemsRepository } from '../items/repository/items.repository'; // para verificar itens
import { ItemsModule } from '../items/items.module'; // se precisar do service, mas usaremos o repository direto

@Module({
  imports: [PrismaModule],
  controllers: [BomController],
  providers: [BomService, BomRepository, ItemsRepository], // injetar ItemsRepository
  exports: [BomService],
})
export class BomModule {}