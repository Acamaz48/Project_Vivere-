import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@service-order/prisma';

@Injectable()
export class OrderItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.order_itemsCreateInput) {
    return this.prisma.order_items.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.order_itemsWhereUniqueInput;
    where?: Prisma.order_itemsWhereInput;
    orderBy?: Prisma.order_itemsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.order_items.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { order: true },
    });
  }

  async findOne(where: Prisma.order_itemsWhereUniqueInput) {
    return this.prisma.order_items.findUnique({
      where,
      include: { order: true },
    });
  }

  async update(params: {
    where: Prisma.order_itemsWhereUniqueInput;
    data: Prisma.order_itemsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.order_items.update({ where, data });
  }

  async remove(where: Prisma.order_itemsWhereUniqueInput) {
    // Soft delete
    return this.prisma.order_items.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  async findByOrder(order_id: string) {
    return this.prisma.order_items.findMany({
      where: { order_id, deleted_at: null },
    });
  }
}