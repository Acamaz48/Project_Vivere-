import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@warehouse/prisma';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.categoriesCreateInput) {
    return this.prisma.categories.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.categoriesWhereUniqueInput;
    where?: Prisma.categoriesWhereInput;
    orderBy?: Prisma.categoriesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.categories.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { parent: true, children: true },
    });
  }

  async findOne(where: Prisma.categoriesWhereUniqueInput) {
    return this.prisma.categories.findUnique({
      where,
      include: { parent: true, children: true },
    });
  }

  async update(params: {
    where: Prisma.categoriesWhereUniqueInput;
    data: Prisma.categoriesUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.categories.update({ where, data });
  }

  async remove(where: Prisma.categoriesWhereUniqueInput) {
    // Soft delete
    return this.prisma.categories.update({
      where,
      data: { deleted_at: new Date() },
    });
  }
}