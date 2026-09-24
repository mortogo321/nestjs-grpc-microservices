import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

interface Order {
  id: string;
  userId: string;
  product: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
}

@Controller()
export class OrderController {
  private readonly orders: Order[] = [
    {
      id: '1',
      userId: '1',
      product: 'Mechanical Keyboard',
      quantity: 1,
      price: 149.99,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '2',
      product: 'USB-C Hub',
      quantity: 2,
      price: 39.99,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ];

  @GrpcMethod('OrderService', 'GetOrder')
  getOrder(data: { id: string }): Order {
    const order = this.orders.find((o) => o.id === data.id);
    if (!order) {
      throw new NotFoundException(`Order with id ${data.id} not found`);
    }
    return order;
  }

  @GrpcMethod('OrderService', 'GetOrders')
  getOrders(): { orders: Order[] } {
    return { orders: this.orders };
  }

  @GrpcMethod('OrderService', 'CreateOrder')
  createOrder(data: { userId: string; product: string; quantity: number; price: number }): Order {
    const order: Order = {
      id: randomUUID(),
      userId: data.userId,
      product: data.product,
      quantity: data.quantity,
      price: data.price,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }
}
