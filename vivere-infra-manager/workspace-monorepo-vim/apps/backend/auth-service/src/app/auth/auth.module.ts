import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { SessionsModule } from '../sessions/sessions.module';
import { LoginHistoryModule } from '../login-history/login-history.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { PasswordService } from '../common/password';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    LoginHistoryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService],
  exports: [AuthService],
})
export class AuthModule {}