import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LocationsRepository } from './repository/locations.repository';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { locations, LocationType } from '@logistics/prisma';

@Injectable()
export class LocationsService {
  constructor(private readonly repo: LocationsRepository) {}

  async create(createDto: CreateLocationDto): Promise<locations> {
    // Validação da constraint: se type = EVENT, order_id é obrigatório
    if (createDto.type === 'EVENT' && !createDto.order_id) {
      throw new BadRequestException('Para locais do tipo EVENT, order_id é obrigatório');
    }
    return this.repo.create(createDto);
  }

  async findAll(): Promise<locations[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<locations> {
    const location = await this.repo.findOne({ id });
    if (!location) {
      throw new NotFoundException(`Local com ID ${id} não encontrado`);
    }
    return location;
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<locations> {
    const current = await this.findOne(id);
    // Se estiver alterando type para EVENT, precisa de order_id
    if (updateDto.type === 'EVENT' && !updateDto.order_id) {
      // Verificar se o registro atual já tem order_id ou se o DTO não fornece
      if (!current.order_id && !updateDto.order_id) {
        throw new BadRequestException('Para locais do tipo EVENT, order_id é obrigatório');
      }
    }
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByType(type: string): Promise<locations[]> {
    return this.repo.findAll({ where: { type: type as LocationType } });
  }

  async findByOrder(order_id: string): Promise<locations[]> {
    return this.repo.findAll({ where: { order_id } });
  }
}