import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@warehouse/prisma';

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.itemsCreateInput) {
    return this.prisma.items.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.itemsWhereUniqueInput;
    where?: Prisma.itemsWhereInput;
    orderBy?: Prisma.itemsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.items.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { category: true, parent_boms: true, child_boms: true },
    });
  }

  async findOne(where: Prisma.itemsWhereUniqueInput) {
    return this.prisma.items.findUnique({
      where,
      include: { category: true, parent_boms: true, child_boms: true },
    });
  }

  async update(params: {
    where: Prisma.itemsWhereUniqueInput;
    data: Prisma.itemsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.items.update({ where, data });
  }

  async remove(where: Prisma.itemsWhereUniqueInput) {
    // Soft delete
    return this.prisma.items.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  async findBySku(sku: string) {
    return this.prisma.items.findFirst({
      where: { sku, deleted_at: null },
    });
  }
}