import { Module } from '@nestjs/common';
import { OrganizationPersonsService } from './organization-persons.service';
import { OrganizationPersonsController } from './organization-persons.controller';
import { OrganizationPersonsRepository } from './repository/organization-persons.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationPersonsController],
  providers: [OrganizationPersonsService, OrganizationPersonsRepository],
  exports: [OrganizationPersonsService],
})
export class OrganizationPersonsModule {}