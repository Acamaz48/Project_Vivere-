import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@logistics/prisma';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: Prisma.inventoryCreateInput) {
    // Como a chave é composta, usamos upsert
    const { location_id, item_id, ...rest } = data as any;
    return this.prisma.inventory.upsert({
      where: {
        location_id_item_id: {
          location_id,
          item_id,
        },
      },
      update: rest,
      create: data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.inventoryWhereUniqueInput;
    where?: Prisma.inventoryWhereInput;
    orderBy?: Prisma.inventoryOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.inventory.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { location: true },
    });
  }

  async findOne(location_id: string, item_id: string) {
    return this.prisma.inventory.findUnique({
      where: {
        location_id_item_id: {
          location_id,
          item_id,
        },
      },
      include: { location: true },
    });
  }

  async update(location_id: string, item_id: string, data: Prisma.inventoryUpdateInput) {
    return this.prisma.inventory.update({
      where: {
        location_id_item_id: {
          location_id,
          item_id,
        },
      },
      data,
    });
  }

  async remove(location_id: string, item_id: string) {
    // Inventory não tem soft delete, apenas remoção física
    return this.prisma.inventory.delete({
      where: {
        location_id_item_id: {
          location_id,
          item_id,
        },
      },
    });
  }

  // Métodos de consulta agregada
  async getTotalByItem(item_id: string) {
    return this.prisma.inventory.aggregate({
      where: { item_id },
      _sum: { quantity: true },
    });
  }
}