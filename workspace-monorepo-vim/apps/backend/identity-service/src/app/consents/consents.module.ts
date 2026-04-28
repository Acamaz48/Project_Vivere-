import { Module } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { ConsentsController } from './consents.controller';
import { ConsentsRepository } from './repository/consents.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsentsController],
  providers: [ConsentsService, ConsentsRepository],
  exports: [ConsentsService],
})
export class ConsentsModule {}