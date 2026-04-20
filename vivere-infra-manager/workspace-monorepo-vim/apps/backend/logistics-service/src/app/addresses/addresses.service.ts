import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressesRepository } from './repository/addresses.repository';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { addresses } from '@logistics/prisma';

@Injectable()
export class AddressesService {
  constructor(private readonly repo: AddressesRepository) {}

  async create(createDto: CreateAddressDto): Promise<addresses> {
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
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }
}