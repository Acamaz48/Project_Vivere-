import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MovementsRepository } from './repository/movements.repository';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { movements } from '@logistics/prisma';

@Injectable()
export class MovementsService {
  constructor(private readonly repo: MovementsRepository) {}

  async create(createDto: CreateMovementDto): Promise<movements> {
    const { from_location_id, to_location_id, ...rest } = createDto;

    if (!from_location_id && !to_location_id) {
      throw new BadRequestException('Deve haver pelo menos uma localização de origem ou destino');
    }

    const data: any = { ...rest };
    if (from_location_id) {
      data.from_location = { connect: { id: from_location_id } };
    }
    if (to_location_id) {
      data.to_location = { connect: { id: to_location_id } };
    }

    return this.repo.create(data);
  }

  async findAll(): Promise<movements[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<movements> {
    const movement = await this.repo.findOne({ id });
    if (!movement) {
      throw new NotFoundException(`Movimentação com ID ${id} não encontrada`);
    }
    return movement;
  }

  async update(id: string, updateDto: UpdateMovementDto): Promise<movements> {
    await this.findOne(id);
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByItem(itemId: string): Promise<movements[]> {
    return this.repo.findAll({ where: { item_id: itemId } });
  }

  async findByPeriod(start: Date, end: Date): Promise<movements[]> {
    return this.repo.getMovementsByPeriod(start, end);
  }
}