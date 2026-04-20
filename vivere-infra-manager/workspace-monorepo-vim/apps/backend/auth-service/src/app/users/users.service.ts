import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se e-mail já existe
    const existingUser = await this.repo.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já está em uso');
    }
    return this.repo.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar se existe
    await this.findOne(id);

    // Se estiver alterando e-mail, verificar se o novo e-mail já existe (e não é o mesmo usuário)
    if (updateUserDto.email) {
      const existingUser = await this.repo.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('E-mail já está em uso');
      }
    }

    return this.repo.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`Usuário com e-mail ${email} não encontrado`);
    }
    return user;
  }
}