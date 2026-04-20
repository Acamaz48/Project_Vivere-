import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@identity/prisma';

@Injectable()
export class ConsentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.consentsCreateInput) {
    return this.prisma.consents.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.consentsWhereUniqueInput;
    where?: Prisma.consentsWhereInput;
    orderBy?: Prisma.consentsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.consents.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { person: true },
    });
  }

  async findOne(where: Prisma.consentsWhereUniqueInput) {
    return this.prisma.consents.findUnique({
      where,
      include: { person: true },
    });
  }

  async update(params: {
    where: Prisma.consentsWhereUniqueInput;
    data: Prisma.consentsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.consents.update({ where, data });
  }

  async remove(where: Prisma.consentsWhereUniqueInput) {
    // Como consents não tem soft delete (talvez devesse?), podemos remover fisicamente
    return this.prisma.consents.delete({ where });
  }
}