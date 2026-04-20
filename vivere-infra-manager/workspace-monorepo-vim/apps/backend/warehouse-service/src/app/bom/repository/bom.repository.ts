import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@warehouse/prisma';

@Injectable()
export class BomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.bomCreateInput) {
    return this.prisma.bom.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.bomWhereUniqueInput;
    where?: Prisma.bomWhereInput;
    orderBy?: Prisma.bomOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.bom.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { parent_item: true, child_item: true },
    });
  }

  async findOne(where: Prisma.bomWhereUniqueInput) {
    return this.prisma.bom.findUnique({
      where,
      include: { parent_item: true, child_item: true },
    });
  }

  async update(params: {
    where: Prisma.bomWhereUniqueInput;
    data: Prisma.bomUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.bom.update({ where, data });
  }

  async remove(where: Prisma.bomWhereUniqueInput) {
    // Soft delete
    return this.prisma.bom.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  async findByParent(parent_item_id: string) {
    return this.prisma.bom.findMany({
      where: { parent_item_id, deleted_at: null },
      include: { child_item: true },
    });
  }

  async findByChild(child_item_id: string) {
    return this.prisma.bom.findMany({
      where: { child_item_id, deleted_at: null },
      include: { parent_item: true },
    });
  }
}