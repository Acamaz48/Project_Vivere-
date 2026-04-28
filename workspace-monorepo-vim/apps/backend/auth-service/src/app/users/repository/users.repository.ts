import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@auth/prisma';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Alterado: Prisma.UserCreateInput e this.prisma.user
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { login_history: true, user_roles: true },
    });
  }

  async findOne(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where,
      include: { login_history: true, user_roles: true },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.user.update({ where, data });
  }

  async remove(where: Prisma.UserWhereUniqueInput) {
    // Soft delete usando o campo is_active ou deleted_at
    return this.prisma.user.update({
      where,
      data: { deleted_at: new Date() },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });
  }
}