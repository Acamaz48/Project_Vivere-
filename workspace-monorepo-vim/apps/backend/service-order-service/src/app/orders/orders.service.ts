import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { OrdersRepository } from './repository/orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { orders, OrderStatus } from '@service-order/prisma';

@Injectable()
export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  async create(createDto: CreateOrderDto): Promise<orders> {
    // Verificar se código já existe (índice único)
    const existing = await this.repo.findByCode(createDto.code);
    if (existing) {
      throw new ConflictException(`Código ${createDto.code} já está em uso`);
    }
    return this.repo.create(createDto);
  }

  async findAll(customerId?: string, status?: string): Promise<orders[]> {
    const where: any = {};
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status as OrderStatus;
    return this.repo.findAll({ where });
  }

  async findOne(id: string): Promise<orders> {
    const order = await this.repo.findOne({ id });
    if (!order) {
      throw new NotFoundException(`Ordem com ID ${id} não encontrada`);
    }
    return order;
  }

  async update(id: string, updateDto: UpdateOrderDto): Promise<orders> {
    await this.findOne(id);

    // Se estiver alterando código, verificar se já existe (excluindo a si mesmo)
    if (updateDto.code) {
      const existing = await this.repo.findByCode(updateDto.code);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Código ${updateDto.code} já está em uso`);
      }
    }

    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByCode(code: string): Promise<orders> {
    const order = await this.repo.findByCode(code);
    if (!order) {
      throw new NotFoundException(`Ordem com código ${code} não encontrada`);
    }
    return order;
  }
}