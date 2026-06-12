import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}



  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Compute totalCents for precise currency handling
    const computedTotal = (createOrderDto.total ?? 0) || (
      Array.isArray((createOrderDto as any).items)
        ? (createOrderDto as any).items.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 0), 0)
        : 0
    );
    const totalCents = Math.round(Number(computedTotal) * 100);

    const orderEntity = this.ordersRepository.create({
      ...createOrderDto,
      total: Number(computedTotal),
      totalCents,
    });
    return this.ordersRepository.save(orderEntity);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }
}
