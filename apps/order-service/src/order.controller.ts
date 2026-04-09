import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

interface Order {
  id: string;
  userId: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  createdAt: string;
}

interface GetOrderRequest {
  id: string;
}

interface CreateOrderRequest {
  userId: string;
  product: string;
  quantity: number;
  price: number;
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
      total: 149.99,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    },
  ];

  private nextId = 2;

  @GrpcMethod('OrderService', 'GetOrder')
  getOrder(data: GetOrderRequest): Order {
    const order = this.orders.find((o) => o.id === data.id);
    if (!order) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Order with id ${data.id} not found`,
      });
    }
    return order;
  }

  @GrpcMethod('OrderService', 'GetOrders')
  getOrders(): { orders: Order[] } {
    return { orders: this.orders };
  }

  @GrpcMethod('OrderService', 'CreateOrder')
  createOrder(data: CreateOrderRequest): Order {
    const order: Order = {
      id: String(this.nextId++),
      userId: data.userId,
      product: data.product,
      quantity: data.quantity,
      price: data.price,
      total: data.quantity * data.price,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }
}
