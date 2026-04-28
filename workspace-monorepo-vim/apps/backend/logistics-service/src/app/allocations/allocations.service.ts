import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AllocationsRepository } from './repository/allocations.repository';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { allocations } from '@logistics/prisma';

@Injectable()
export class AllocationsService {
  constructor(private readonly repo: AllocationsRepository) {}

  async create(createDto: CreateAllocationDto): Promise<allocations> {
    const { location_id, created_by, ...rest } = createDto;

    // Validação de período
    const start = new Date(rest.period_start);
    const end = new Date(rest.period_end);
    if (start >= end) {
      throw new BadRequestException('period_start deve ser anterior a period_end');
    }

    const data = {
      ...rest,
      created_by, // agora é string obrigatória
      location: { connect: { id: location_id } },
    };

    return this.repo.create(data);
  }

  async findAll(): Promise<allocations[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<allocations> {
    const allocation = await this.repo.findOne({ id });
    if (!allocation) {
      throw new NotFoundException(`Reserva com ID ${id} não encontrada`);
    }
    return allocation;
  }

  async update(id: string, updateDto: UpdateAllocationDto): Promise<allocations> {
    await this.findOne(id);
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByItem(itemId: string): Promise<allocations[]> {
    return this.repo.findAll({ where: { item_id: itemId } });
  }

  async findByLocation(locationId: string): Promise<allocations[]> {
    return this.repo.findAll({ where: { location_id: locationId } });
  }

  async findByItemAndLocation(itemId: string, locationId: string): Promise<allocations[]> {
    return this.repo.findAll({ where: { item_id: itemId, location_id: locationId } });
  }

  async checkAvailability(
    itemId: string,
    locationId: string,
    start: Date,
    end: Date,
  ): Promise<{ available: number; conflicts: any[] }> {
    const conflicts = await this.repo.findConflicting(itemId, locationId, start, end);
    // const totalConflicting = conflicts.reduce((sum, c) => sum + Number(c.quantity), 0);
    // Aqui deveria buscar o estoque total do item no local (inventory) e calcular disponível.
    // Por simplicidade, retornamos apenas conflitos.
    return { available: -1, conflicts };
  }
}