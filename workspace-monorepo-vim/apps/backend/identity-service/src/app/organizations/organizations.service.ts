import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationsRepository } from './repository/organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { organizations } from '@identity/prisma';

@Injectable()
export class OrganizationsService {
  constructor(private readonly repo: OrganizationsRepository) {}

  async create(createDto: CreateOrganizationDto): Promise<organizations> {
    // Verificar se CNPJ já existe (o índice parcial garante unicidade, mas fazemos validação amigável)
    const existing = await this.repo.findAll({ where: { tax_id: createDto.tax_id } }).then(r => r[0]);
    if (existing) {
      throw new ConflictException('CNPJ já está cadastrado');
    }
    return this.repo.create(createDto);
  }

  async findAll(): Promise<organizations[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<organizations> {
    const org = await this.repo.findOne({ id });
    if (!org) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }
    return org;
  }

  async update(id: string, updateDto: UpdateOrganizationDto): Promise<organizations> {
    await this.findOne(id);

    // Se estiver alterando CNPJ, verificar se o novo CNPJ já existe (e não é o mesmo)
    if (updateDto.tax_id) {
      const existing = await this.repo.findAll({ where: { tax_id: updateDto.tax_id } }).then(r => r[0]);
      if (existing && existing.id !== id) {
        throw new ConflictException('CNPJ já está em uso');
      }
    }

    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }
}