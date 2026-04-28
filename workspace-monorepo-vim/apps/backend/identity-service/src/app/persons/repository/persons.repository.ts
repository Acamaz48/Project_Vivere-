import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@identity/prisma';

@Injectable()
export class PersonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.personsCreateInput) {
    return this.prisma.persons.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.personsWhereUniqueInput;
    where?: Prisma.personsWhereInput;
    orderBy?: Prisma.personsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.persons.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { addresses: true, consents: true, organization_persons: true },
    });
  }

  async findOne(where: Prisma.personsWhereUniqueInput) {
    return this.prisma.persons.findUnique({
      where,
      include: { addresses: true, consents: true, organization_persons: true },
    });
  }

  async update(params: {
    where: Prisma.personsWhereUniqueInput;
    data: Prisma.personsUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.persons.update({ where, data });
  }

  async remove(where: Prisma.personsWhereUniqueInput) {
    return this.prisma.persons.update({
      where,
      data: { deleted_at: new Date() },
    });
  }
}