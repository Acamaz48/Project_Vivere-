import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './repository/inventory.repository';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { inventory } from '@logistics/prisma';

@Injectable()
export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  async upsert(createDto: CreateInventoryDto): Promise<inventory> {
    const { location_id, item_id, ...rest } = createDto;
    const data = {
      ...rest,
      location: { connect: { id: location_id } },
      item_id, // item_id é scalar, não relation
    };
    return this.repo.upsert(data);
  }

  async findAll(): Promise<inventory[]> {
    return this.repo.findAll({});
  }

  async findOne(locationId: string, itemId: string): Promise<inventory> {
    const record = await this.repo.findOne(locationId, itemId);
    if (!record) {
      throw new NotFoundException(`Estoque não encontrado para local ${locationId} e item ${itemId}`);
    }
    return record;
  }

  async update(locationId: string, itemId: string, updateDto: UpdateInventoryDto): Promise<inventory> {
    await this.findOne(locationId, itemId);
    return this.repo.update(locationId, itemId, updateDto);
  }

  async remove(locationId: string, itemId: string): Promise<void> {
    await this.findOne(locationId, itemId);
    await this.repo.remove(locationId, itemId);
  }

  async findByItem(itemId: string): Promise<inventory[]> {
    return this.repo.findAll({ where: { item_id: itemId } });
  }
}