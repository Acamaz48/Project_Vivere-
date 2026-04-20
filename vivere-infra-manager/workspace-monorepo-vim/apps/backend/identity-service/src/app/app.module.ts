import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PersonsModule } from './persons/persons.module';
import { OrganizationPersonsModule } from './organization-persons/organization-persons.module';
import { AddressesModule } from './addresses/addresses.module';
import { ConsentsModule } from './consents/consents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OrganizationsModule,
    PersonsModule,
    OrganizationPersonsModule,
    AddressesModule,
    ConsentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}