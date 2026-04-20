import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@logistics/prisma';

// Tipo para o resultado da consulta raw (conflitos)
export type ConflictingAllocation = {
  id: string;
  item_id: string;
  location_id: string;
  quantity: number;
  period_start: Date;
  period_end: Date;
};

@Injectable()
export class AllocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.allocationsCreateInput) {
    return this.prisma.allocations.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.allocationsWhereUniqueInput;
    where?: Prisma.allocationsWhereInput;
    orderBy?: Prisma.allocationsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.allocations.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { location: true },
    });
  }


  async findOne(where: Prisma.allocationsWhereUniqueInput) {
    return this.prisma.allocations.findUnique({
      where,
      include: { location: true },
    });
  }

  async update(params: {
    where: Prisma.allocationsWhereUniqueInput;
    data: Prisma.allocationsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.allocations.update({ where, data });
  }

  async remove(where: Prisma.allocationsWhereUniqueInput) {
    // Allocations não tem soft delete (mas pode ser adicionado). Por enquanto remoção física.
    return this.prisma.allocations.delete({ where });
  }

  // Métodos específicos para verificação de disponibilidade
  async findConflicting(
    item_id: string,
    location_id: string,
    start: Date,
    end: Date,
  ): Promise<ConflictingAllocation[]> {
    return this.prisma.$queryRaw<ConflictingAllocation[]>`
      SELECT id, item_id, location_id, quantity, period_start, period_end
      FROM allocations
      WHERE item_id = ${item_id}::uuid
        AND location_id = ${location_id}::uuid
        AND tstzrange(period_start, period_end, '[)') && tstzrange(${start}::timestamptz, ${end}::timestamptz, '[)')
    `;
  }
}