import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';

@Module({
  imports: [PrismaModule, OrdersModule, OrderItemsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}