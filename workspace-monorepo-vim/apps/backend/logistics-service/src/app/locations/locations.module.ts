import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationsRepository } from './repository/locations.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository],
  exports: [LocationsService],
})
export class LocationsModule {}