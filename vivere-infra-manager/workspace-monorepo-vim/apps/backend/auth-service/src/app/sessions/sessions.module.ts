import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtStrategy } from './strategies/jwt.strategies';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports : [PrismaModule],
  controllers: [SessionsController],
  providers: [SessionsService, JwtStrategy],
  exports: [SessionsService],
})
export class SessionsModule {}