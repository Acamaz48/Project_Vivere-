import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRolesRepository } from './repository/user-roles.repository';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { user_roles } from '@auth/prisma';

@Injectable()
export class UserRolesService {
  constructor(private readonly repo: UserRolesRepository) {}

  async create(createDto: CreateUserRoleDto): Promise<user_roles> {
    const { user_id, role_code, assigned_by } = createDto;
    const existing = await this.repo.findOne(user_id, role_code).catch(() => null);
    if (existing) {
      throw new ConflictException('Usuário já possui este perfil');
    }
    const data = {
      assigned_by,
      user: { connect: { id: user_id } },
      role: { connect: { code: role_code } },
    };
    return this.repo.create(data);
  }

  async findAll(): Promise<user_roles[]> {
    return this.repo.findAll({});
  }

  async findOne(user_id: string, role_code: string): Promise<user_roles> {
    const relation = await this.repo.findOne(user_id, role_code);
    if (!relation) {
      throw new NotFoundException('Relação não encontrada');
    }
    return relation;
  }

  async update(user_id: string, role_code: string, updateDto: UpdateUserRoleDto): Promise<user_roles> {
    await this.findOne(user_id, role_code);
    return this.repo.update(user_id, role_code, updateDto);
  }

  async remove(user_id: string, role_code: string): Promise<void> {
    await this.findOne(user_id, role_code);
    await this.repo.remove(user_id, role_code);
  }

  async findByUser(user_id: string): Promise<user_roles[]> {
    return this.repo.findByUser(user_id);
  }
}