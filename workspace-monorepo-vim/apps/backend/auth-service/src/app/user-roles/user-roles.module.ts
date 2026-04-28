import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { UserRolesRepository } from './repository/user-roles.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserRolesController],
  providers: [UserRolesService, UserRolesRepository],
  exports: [UserRolesService],
})
export class UserRolesModule {}