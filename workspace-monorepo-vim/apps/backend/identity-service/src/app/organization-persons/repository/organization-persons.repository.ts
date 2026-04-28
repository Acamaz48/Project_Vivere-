import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@identity/prisma';

@Injectable()
export class OrganizationPersonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.organization_personsCreateInput) {
    return this.prisma.organization_persons.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.organization_personsWhereUniqueInput;
    where?: Prisma.organization_personsWhereInput;
    orderBy?: Prisma.organization_personsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.organization_persons.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { organization: true, person: true },
    });
  }

  async findOne(
    organization_id: string,
    person_id: string,
    role: string,
  ) {
    return this.prisma.organization_persons.findUnique({
      where: {
        organization_id_person_id_role: {
          organization_id,
          person_id,
          role,
        },
      },
      include: { organization: true, person: true },
    });
  }

  async update(
    organization_id: string,
    person_id: string,
    role: string,
    data: Prisma.organization_personsUpdateInput,
  ) {
    return this.prisma.organization_persons.update({
      where: {
        organization_id_person_id_role: {
          organization_id,
          person_id,
          role,
        },
      },
      data,
    });
  }

  async remove(organization_id: string, person_id: string, role: string) {
    // Como não há soft delete definido na tabela, podemos remover fisicamente
    return this.prisma.organization_persons.delete({
      where: {
        organization_id_person_id_role: {
          organization_id,
          person_id,
          role,
        },
      },
    });
  }
}