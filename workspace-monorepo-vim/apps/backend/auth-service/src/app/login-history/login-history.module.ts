import { Module } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryController } from './login-history.controller';
import { LoginHistoryRepository } from './repository/login-history.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LoginHistoryController],
  providers: [LoginHistoryService, LoginHistoryRepository],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule {}