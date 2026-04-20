import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderItemsRepository } from './repository/order-items.repository';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { order_items } from '@service-order/prisma';

@Injectable()
export class OrderItemsService {
  constructor(private readonly repo: OrderItemsRepository) {}

  async create(createDto: CreateOrderItemDto): Promise<order_items> {
    const { order_id, ...rest } = createDto;

    if (!rest.item_id && !rest.supplier_id) {
      throw new BadRequestException('É necessário informar item_id (próprio) ou supplier_id (terceiro)');
    }
    if (rest.item_id && rest.supplier_id) {
      throw new BadRequestException('Não é permitido informar ambos item_id e supplier_id');
    }

    const start = new Date(rest.period_start);
    const end = new Date(rest.period_end);
    if (start >= end) {
      throw new BadRequestException('period_start deve ser anterior a period_end');
    }

    const data = {
      ...rest,
      order: { connect: { id: order_id } },
    };

    return this.repo.create(data);
  }

  async findAll(): Promise<order_items[]> {
    return this.repo.findAll({});
  }

  async findOne(id: string): Promise<order_items> {
    const item = await this.repo.findOne({ id });
    if (!item) {
      throw new NotFoundException(`Item com ID ${id} não encontrado`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateOrderItemDto): Promise<order_items> {
    await this.findOne(id);
    return this.repo.update({ where: { id }, data: updateDto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.remove({ id });
  }

  async findByOrder(order_id: string): Promise<order_items[]> {
    return this.repo.findByOrder(order_id);
  }
}