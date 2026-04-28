import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@logistics/prisma';

@Injectable()
export class MovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.movementsCreateInput) {
    return this.prisma.movements.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.movementsWhereUniqueInput;
    where?: Prisma.movementsWhereInput;
    orderBy?: Prisma.movementsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.movements.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { from_location: true, to_location: true },
    });
  }

  async findOne(where: Prisma.movementsWhereUniqueInput) {
    return this.prisma.movements.findUnique({
      where,
      include: { from_location: true, to_location: true },
    });
  }

  async update(params: {
    where: Prisma.movementsWhereUniqueInput;
    data: Prisma.movementsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.movements.update({ where, data });
  }

  async remove(where: Prisma.movementsWhereUniqueInput) {
    // Movimentações geralmente não são removidas (auditoria), mas implementamos se necessário
    return this.prisma.movements.delete({ where });
  }

  // Métodos para relatórios
  async getMovementsByPeriod(start: Date, end: Date) {
    return this.prisma.movements.findMany({
      where: {
        occurred_at: { gte: start, lte: end },
      },
      orderBy: { occurred_at: 'desc' },
    });
  }
}