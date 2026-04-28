import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginHistoryRepository } from './repository/login-history.repository';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
import { UpdateLoginHistoryDto } from './dto/update-login-history.dto';
import { login_history } from '@auth/prisma';

@Injectable()
export class LoginHistoryService {
  constructor(private readonly repo: LoginHistoryRepository) {}

  async create(createDto: CreateLoginHistoryDto): Promise<login_history> {
  return this.repo.create(createDto);
}

  async findAll(): Promise<login_history[]> {
    return this.repo.findAll({ orderBy: { login_at: 'desc' } });
  }

  async findOne(id: string): Promise<login_history> {
    const record = await this.repo.findOne({ id });
    if (!record) {
      throw new NotFoundException(`Registro com ID ${id} não encontrado`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateLoginHistoryDto): Promise<login_history> {
    await this.findOne(id);
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<login_history> { 
  await this.findOne(id);
  return this.repo.remove({ id }); 
  }

  async findByUser(userId: string): Promise<login_history[]> {
    return this.repo.findAll({ where: { user_id: userId }, orderBy: { login_at: 'desc' } });
  }

  /* ================= MÉTODOS DE AUDITORIA ================= */

  async logSuccess(userId: string): Promise<login_history> {
    // Forçamos o tipo para evitar erros de tipagem com o DTO
    return this.create({
      user_id: userId,
      // Se houver um campo de status no seu DTO, você pode passá-rlo aqui, ex: status: 'SUCCESS'
    } as unknown as CreateLoginHistoryDto);
  }

  async logFailure(userId: string, email: string): Promise<login_history | null> {
    // Se o usuário não existe, evitamos quebrar o connect do Prisma
    if (userId === 'UNKNOWN') {
      console.warn(`[Auditoria] Tentativa de login falhou para email não cadastrado: ${email}`);
      return null;
    }

    return this.create({
    user_id: userId,
    status: 'SUCCESS',
  } as unknown as CreateLoginHistoryDto);
    return this.create({
    user_id: userId,
    status: 'FAILED',
  } as unknown as CreateLoginHistoryDto);
  
  }
}