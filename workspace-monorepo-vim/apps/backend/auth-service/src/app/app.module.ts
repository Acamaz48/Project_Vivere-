import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { LoginHistoryModule } from './login-history/login-history.module';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    LoginHistoryModule,
    RolesModule,
    UserRolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}