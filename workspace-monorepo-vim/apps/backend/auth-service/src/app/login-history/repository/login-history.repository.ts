import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@auth/prisma'; 

@Injectable()
export class LoginHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.login_historyUncheckedCreateInput) {
    return this.prisma.login_history.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.login_historyWhereUniqueInput;
    where?: Prisma.login_historyWhereInput;
    orderBy?: Prisma.login_historyOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.login_history.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { user: true },
    });
  }

  async findOne(where: Prisma.login_historyWhereUniqueInput) {
    return this.prisma.login_history.findUnique({
      where,
      include: { user: true },
    });
  }

  async update(params: {
    where: Prisma.login_historyWhereUniqueInput;
    data: Prisma.login_historyUpdateInput;
  }) {
    const { where, data } = params;

    return this.prisma.login_history.update({
      where,
      data,
    });
  }

  async remove(where: Prisma.login_historyWhereUniqueInput) {
    return this.prisma.login_history.delete({
      where,
    });
  }
}