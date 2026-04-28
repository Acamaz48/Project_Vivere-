import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationPersonsRepository } from './repository/organization-persons.repository';
import { CreateOrganizationPersonDto } from './dto/create-organization-person.dto';
import { UpdateOrganizationPersonDto } from './dto/update-organization-person.dto';
import { organization_persons } from '@identity/prisma';

@Injectable()
export class OrganizationPersonsService {
  constructor(private readonly repo: OrganizationPersonsRepository) {}

  async create(createDto: CreateOrganizationPersonDto): Promise<organization_persons> {
    const { organization_id, person_id, role, start_date, end_date, created_by } = createDto;
    const existing = await this.repo.findOne(organization_id, person_id, role).catch(() => null);
    if (existing) {
      throw new ConflictException('Este vínculo já existe');
    }
    const data = {
      role,
      start_date,
      end_date,
      created_by,
      organization: { connect: { id: organization_id } },
      person: { connect: { id: person_id } },
    };
    return this.repo.create(data);
  }

  async findAll(): Promise<organization_persons[]> {
    return this.repo.findAll({});
  }

  async findOne(organization_id: string, person_id: string, role: string): Promise<organization_persons> {
    const relation = await this.repo.findOne(organization_id, person_id, role);
    if (!relation) {
      throw new NotFoundException('Vínculo não encontrado');
    }
    return relation;
  }

  async update(
    organization_id: string,
    person_id: string,
    role: string,
    updateDto: UpdateOrganizationPersonDto,
  ): Promise<organization_persons> {
    await this.findOne(organization_id, person_id, role);
    return this.repo.update(organization_id, person_id, role, updateDto);
  }

  async remove(organization_id: string, person_id: string, role: string): Promise<void> {
    await this.findOne(organization_id, person_id, role);
    await this.repo.remove(organization_id, person_id, role);
  }

  async findByOrganization(organization_id: string): Promise<organization_persons[]> {
    return this.repo.findAll({ where: { organization_id } });
  }

  async findByPerson(person_id: string): Promise<organization_persons[]> {
    return this.repo.findAll({ where: { person_id } });
  }
}