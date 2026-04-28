import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@service-order/prisma';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ordersCreateInput) {
    return this.prisma.orders.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ordersWhereUniqueInput;
    where?: Prisma.ordersWhereInput;
    orderBy?: Prisma.ordersOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.orders.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { items: true },
    });
  }

  async findOne(where: Prisma.ordersWhereUniqueInput) {
    return this.prisma.orders.findUnique({
      where,
      include: { items: true },
    });
  }

  async update(params: {
    where: Prisma.ordersWhereUniqueInput;
    data: Prisma.ordersUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.orders.update({ where, data });
  }

  async remove(where: Prisma.ordersWhereUniqueInput) {
    // Soft delete
    return this.prisma.orders.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  async findByCode(code: string) {
    return this.prisma.orders.findFirst({
      where: { code, deleted_at: null },
    });
  }
}