import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { LoginHistoryModule } from './login-history/login-history.module';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user-roles/user-roles.module';

@Module({
  imports: [
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