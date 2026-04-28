import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@auth/prisma';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.rolesCreateInput) {
    return this.prisma.roles.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.rolesWhereUniqueInput;
    where?: Prisma.rolesWhereInput;
    orderBy?: Prisma.rolesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.roles.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { user_roles: true },
    });
  }

  async findOne(where: Prisma.rolesWhereUniqueInput) {
    return this.prisma.roles.findUnique({
      where,
      include: { user_roles: true },
    });
  }

  async update(params: {
    where: Prisma.rolesWhereUniqueInput;
    data: Prisma.rolesUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.roles.update({ where, data });
  }

  async remove(where: Prisma.rolesWhereUniqueInput) {
    // Perfis podem ter dependências, talvez usar soft delete? Mas não há campo deleted_at.
    return this.prisma.roles.delete({ where });
  }
}