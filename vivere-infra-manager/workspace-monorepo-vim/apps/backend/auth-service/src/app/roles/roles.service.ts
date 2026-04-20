import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RolesRepository } from './repository/roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { roles } from '@auth/prisma';

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto): Promise<roles> {
    // Verificar se código já existe
    const existing = await this.repo.findOne({ code: createRoleDto.code }).catch(() => null);
    if (existing) {
      throw new ConflictException(`Perfil com código ${createRoleDto.code} já existe`);
    }
    return this.repo.create(createRoleDto);
  }

  async findAll(): Promise<roles[]> {
    return this.repo.findAll({});
  }

  async findOne(code: string): Promise<roles> {
    const role = await this.repo.findOne({ code });
    if (!role) {
      throw new NotFoundException(`Perfil com código ${code} não encontrado`);
    }
    return role;
  }

  async update(code: string, updateRoleDto: UpdateRoleDto): Promise<roles> {
    await this.findOne(code);
    return this.repo.update({ where: { code }, data: updateRoleDto });
  }

  async remove(code: string): Promise<void> {
    await this.findOne(code);
    await this.repo.remove({ code });
  }
}