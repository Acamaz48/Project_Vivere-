import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PersonsRepository } from './repository/persons.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { persons } from '@identity/prisma';

@Injectable()
export class PersonsService {
  constructor(private readonly repo: PersonsRepository) {}

  async create(createDto: CreatePersonDto): Promise<persons> {
    // Verificar CPF se informado
    if (createDto.tax_id) {
      const existing = await this.repo.findAll({ where: { tax_id: createDto.tax_id } }).then(r => r[0]);
      if (existing) {
        throw new ConflictException('CPF já está cadastrado');
      }
    }
    return this.repo.create(createDto);
  }

  async findAll(): Promise<persons[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<persons> {
    const person = await this.repo.findOne({ id });
    if (!person) {
      throw new NotFoundException(`Pessoa com ID ${id} não encontrada`);
    }
    return person;
  }

  async update(id: string, updateDto: UpdatePersonDto): Promise<persons> {
    await this.findOne(id);

    if (updateDto.tax_id) {
      const existing = await this.repo.findAll({ where: { tax_id: updateDto.tax_id } }).then(r => r[0]);
      if (existing && existing.id !== id) {
        throw new ConflictException('CPF já está em uso');
      }
    }

    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }
}