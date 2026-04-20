import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsentsRepository } from './repository/consents.repository';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { consents } from '@identity/prisma';

@Injectable()
export class ConsentsService {
  constructor(private readonly repo: ConsentsRepository) {}

  async create(createDto: CreateConsentDto): Promise<consents> {
    const { person_id, ...rest } = createDto;
    const data = {
      ...rest,
      person: { connect: { id: person_id } },
    };
    return this.repo.create(data);
  }

  async findAll(): Promise<consents[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<consents> {
    const consent = await this.repo.findOne({ id });
    if (!consent) {
      throw new NotFoundException(`Consentimento com ID ${id} não encontrado`);
    }
    return consent;
  }

  async update(id: string, updateDto: UpdateConsentDto): Promise<consents> {
    await this.findOne(id);
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByPerson(person_id: string): Promise<consents[]> {
    return this.repo.findAll({ where: { person_id } });
  }
}