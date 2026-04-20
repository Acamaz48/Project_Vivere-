import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AddressesRepository } from './repository/addresses.repository';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { addresses } from '@identity/prisma';

@Injectable()
export class AddressesService {
  constructor(private readonly repo: AddressesRepository) {}

  async create(createDto: CreateAddressDto): Promise<addresses> {
    // Validação: deve ter organization_id ou person_id (exclusivo)
    if (!createDto.organization_id && !createDto.person_id) {
      throw new BadRequestException('É necessário informar organization_id ou person_id');
    }
    if (createDto.organization_id && createDto.person_id) {
      throw new BadRequestException('Não é permitido informar ambos organization_id e person_id');
    }
    return this.repo.create(createDto);
  }

  async findAll(): Promise<addresses[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<addresses> {
    const address = await this.repo.findOne({ id });
    if (!address) {
      throw new NotFoundException(`Endereço com ID ${id} não encontrado`);
    }
    return address;
  }

  async update(id: string, updateDto: UpdateAddressDto): Promise<addresses> {
    await this.findOne(id);

    // Validação se estiver alterando os donos
    if (updateDto.organization_id && updateDto.person_id) {
      throw new BadRequestException('Não é permitido informar ambos organization_id e person_id');
    }

    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByOrganization(organization_id: string): Promise<addresses[]> {
    return this.repo.findAll({ where: { organization_id } });
  }

  async findByPerson(person_id: string): Promise<addresses[]> {
    return this.repo.findAll({ where: { person_id } });
  }
}