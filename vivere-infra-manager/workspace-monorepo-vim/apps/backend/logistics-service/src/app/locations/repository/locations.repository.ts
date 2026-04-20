import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@logistics/prisma';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.locationsCreateInput) {
    return this.prisma.locations.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.locationsWhereUniqueInput;
    where?: Prisma.locationsWhereInput;
    orderBy?: Prisma.locationsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.locations.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { address: true, inventory: true, allocations: true },
    });
  }

  async findOne(where: Prisma.locationsWhereUniqueInput) {
    return this.prisma.locations.findUnique({
      where,
      include: { address: true, inventory: true, allocations: true },
    });
  }

  async update(params: {
    where: Prisma.locationsWhereUniqueInput;
    data: Prisma.locationsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.locations.update({ where, data });
  }

  async remove(where: Prisma.locationsWhereUniqueInput) {
    // Soft delete
    return this.prisma.locations.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  // Método para buscar locais por tipo e/ou order_id
  async findEventLocations(order_id: string) {
    return this.prisma.locations.findMany({
      where: { type: 'EVENT', order_id, deleted_at: null },
    });
  }
}