import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@auth/prisma';

@Injectable()
export class UserRolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.user_rolesCreateInput) {
    return this.prisma.user_roles.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.user_rolesWhereUniqueInput;
    where?: Prisma.user_rolesWhereInput;
    orderBy?: Prisma.user_rolesOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user_roles.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { user: true, role: true },
    });
  }

  async findOne(user_id: string, role_code: string) {
    return this.prisma.user_roles.findUnique({
      where: {
        user_id_role_code: {
          user_id,
          role_code,
        },
      },
      include: { user: true, role: true },
    });
  }

  async update(
    user_id: string,
    role_code: string,
    data: Prisma.user_rolesUpdateInput,
  ) {
    return this.prisma.user_roles.update({
      where: {
        user_id_role_code: {
          user_id,
          role_code,
        },
      },
      data,
    });
  }

  async remove(user_id: string, role_code: string) {
    return this.prisma.user_roles.delete({
      where: {
        user_id_role_code: {
          user_id,
          role_code,
        },
      },
    });
  }

  // Métodos auxiliares
  async findByUser(user_id: string) {
    return this.prisma.user_roles.findMany({
      where: { user_id },
      include: { role: true },
    });
  }
}