import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { BomModule } from './bom/bom.module';

@Module({
  imports: [PrismaModule, CategoriesModule, ItemsModule, BomModule],
  controllers: [],
  providers: [],
})
export class AppModule {}