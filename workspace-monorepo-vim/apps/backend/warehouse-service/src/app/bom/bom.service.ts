import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { BomRepository } from './repository/bom.repository';
import { ItemsRepository } from '../items/repository/items.repository';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { bom } from '@warehouse/prisma';

@Injectable()
export class BomService {
  constructor(
    private readonly repo: BomRepository,
    private readonly itemsRepo: ItemsRepository,
  ) {}

  async create(createDto: CreateBomDto): Promise<bom> {
    const { parent_item_id, child_item_id, quantity, is_optional, version_id } = createDto;

    // Verificar se itens existem
    const parent = await this.itemsRepo.findOne({ id: parent_item_id });
    if (!parent) {
      throw new BadRequestException('Item pai não encontrado');
    }
    const child = await this.itemsRepo.findOne({ id: child_item_id });
    if (!child) {
      throw new BadRequestException('Item filho não encontrado');
    }

    // Verificar duplicata
    const existing = await this.repo.findAll({
      where: {
        parent_item_id,
        child_item_id,
        version_id: version_id || 1,
      },
    });
    if (existing.length > 0) {
      throw new ConflictException('Esta combinação de pai, filho e versão já existe');
    }

    const data = {
      quantity,
      is_optional: is_optional ?? false,
      version_id: version_id ?? 1,
      parent_item: { connect: { id: parent_item_id } },
      child_item: { connect: { id: child_item_id } },
    };

    return this.repo.create(data);
  }

  async findAll(): Promise<bom[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<bom> {
    const relation = await this.repo.findOne({ id });
    if (!relation) {
      throw new NotFoundException(`Relação BOM com ID ${id} não encontrada`);
    }
    return relation;
  }

  async update(id: string, updateDto: UpdateBomDto): Promise<bom> {
    await this.findOne(id);
    // Se alterar pai ou filho, verificar existência
    if (updateDto.parent_item_id) {
      const parent = await this.itemsRepo.findOne({ id: updateDto.parent_item_id });
      if (!parent) throw new BadRequestException('Item pai não encontrado');
    }
    if (updateDto.child_item_id) {
      const child = await this.itemsRepo.findOne({ id: updateDto.child_item_id });
      if (!child) throw new BadRequestException('Item filho não encontrado');
    }
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByParent(parent_item_id: string): Promise<bom[]> {
    return this.repo.findByParent(parent_item_id);
  }

  async findByChild(child_item_id: string): Promise<bom[]> {
    return this.repo.findByChild(child_item_id);
  }
}