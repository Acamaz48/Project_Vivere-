import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository } from './repository/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categories } from '@warehouse/prisma';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  async create(createDto: CreateCategoryDto): Promise<categories> {
    // Verificar se a categoria pai existe (se informada)
    if (createDto.parent_id) {
      const parent = await this.repo.findOne({ id: createDto.parent_id }).catch(() => null);
      if (!parent) {
        throw new BadRequestException('Categoria pai não encontrada');
      }
    }
    return this.repo.create(createDto);
  }

  async findAll(): Promise<categories[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<categories> {
    const category = await this.repo.findOne({ id });
    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
    return category;
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<categories> {
    await this.findOne(id);
    // Se estiver alterando parent_id, verificar se a nova categoria pai existe
    if (updateDto.parent_id) {
      const parent = await this.repo.findOne({ id: updateDto.parent_id }).catch(() => null);
      if (!parent) {
        throw new BadRequestException('Categoria pai não encontrada');
      }
      // Evitar loop infinito: não permitir que a categoria seja pai dela mesma
      if (updateDto.parent_id === id) {
        throw new BadRequestException('Uma categoria não pode ser pai dela mesma');
      }
    }
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    // Verificar se existem subcategorias vinculadas (opcional, mas bom)
    const children = await this.repo.findAll({ where: { parent_id: id } });
    if (children.length > 0) {
      throw new BadRequestException('Não é possível remover uma categoria que possui subcategorias');
    }
    await this.repo.remove({ id });
  }
}