import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@identity/prisma';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.organizationsCreateInput) {
    return this.prisma.organizations.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.organizationsWhereUniqueInput;
    where?: Prisma.organizationsWhereInput;
    orderBy?: Prisma.organizationsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.organizations.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { addresses: true, organization_persons: true },
    });
  }

  async findOne(where: Prisma.organizationsWhereUniqueInput) {
    return this.prisma.organizations.findUnique({
      where,
      include: { addresses: true, organization_persons: true },
    });
  }

  async update(params: {
    where: Prisma.organizationsWhereUniqueInput;
    data: Prisma.organizationsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.organizations.update({
      where,
      data,
    });
  }

  async remove(where: Prisma.organizationsWhereUniqueInput) {
    // Soft delete: atualiza deleted_at
    return this.prisma.organizations.update({
      where,
      data: { deleted_at: new Date() },
    });
  }
}