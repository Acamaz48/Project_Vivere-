import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { AllocationsRepository } from './repository/allocations.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AllocationsController],
  providers: [AllocationsService, AllocationsRepository],
  exports: [AllocationsService],
})
export class AllocationsModule {}