import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@identity/prisma';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.addressesCreateInput) {
    return this.prisma.addresses.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.addressesWhereUniqueInput;
    where?: Prisma.addressesWhereInput;
    orderBy?: Prisma.addressesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.addresses.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { organization: true, person: true },
    });
  }

  async findOne(where: Prisma.addressesWhereUniqueInput) {
    return this.prisma.addresses.findUnique({
      where,
      include: { organization: true, person: true },
    });
  }

  async update(params: {
    where: Prisma.addressesWhereUniqueInput;
    data: Prisma.addressesUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.addresses.update({ where, data });
  }

  async remove(where: Prisma.addressesWhereUniqueInput) {
    // Soft delete
    return this.prisma.addresses.update({
      where,
      data: { deleted_at: new Date() },
    });
  }
}