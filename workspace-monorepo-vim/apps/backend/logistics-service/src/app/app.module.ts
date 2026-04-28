import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AddressesModule } from './addresses/addresses.module';
import { LocationsModule } from './locations/locations.module';
import { InventoryModule } from './inventory/inventory.module';
import { AllocationsModule } from './allocations/allocations.module';
import { MovementsModule } from './movements/movements.module';

@Module({
  imports: [
    PrismaModule,
    AddressesModule,
    LocationsModule,
    InventoryModule,
    AllocationsModule,
    MovementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}